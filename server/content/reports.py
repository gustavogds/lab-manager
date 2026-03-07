import io
import json
from datetime import datetime

from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods

from content.models import ResearchArea, Project, Partnership, Equipment
from accounts.models import User


SECTION_CONFIG = {
    "research_areas": {
        "label": "Áreas de Pesquisa",
        "headers": ["ID", "Título", "Descrição", "Status"],
        "get_data": lambda: ResearchArea.objects.all().order_by("order", "title"),
        "row": lambda item: [
            item.id,
            item.title,
            item.description,
            "Ativo" if item.is_active else "Inativo",
        ],
    },
    "projects": {
        "label": "Projetos",
        "headers": ["ID", "Título", "Descrição", "Integrantes", "Status"],
        "get_data": lambda: Project.objects.all().order_by("order", "title"),
        "row": lambda item: [
            item.id,
            item.title,
            item.description,
            ", ".join(m.name for m in item.members.filter(is_public=True)),
            "Ativo" if item.is_active else "Inativo",
        ],
    },
    "users": {
        "label": "Usuários",
        "headers": ["ID", "Nome", "E-mail", "Cargo", "Funções"],
        "get_data": lambda: User.objects.filter(is_approved=True).order_by("name"),
        "row": lambda item: [
            item.id,
            item.name or "",
            item.email,
            item.position or "",
            ", ".join(item.roles) if item.roles else "",
        ],
    },
    "equipment": {
        "label": "Equipamentos",
        "headers": ["ID Interno", "Nome", "Localização", "Responsável", "Status"],
        "get_data": lambda: Equipment.objects.select_related("assigned_to").all().order_by("order", "name"),
        "row": lambda item: [
            item.custom_id,
            item.name,
            item.location or "",
            item.assigned_to.name if item.assigned_to else "",
            "Ativo" if item.is_active else "Inativo",
        ],
    },
    "partnerships": {
        "label": "Parcerias",
        "headers": ["ID", "Nome", "Link", "Status"],
        "get_data": lambda: Partnership.objects.all().order_by("order", "name"),
        "row": lambda item: [
            item.id,
            item.name,
            item.link or "",
            "Ativo" if item.is_active else "Inativo",
        ],
    },
}

VALID_SECTIONS = set(SECTION_CONFIG.keys())


@login_required
@require_http_methods(["POST"])
def generate_report(request):
    if not hasattr(request.user, "has_role") or not request.user.has_role("professor"):
        return JsonResponse({"error": "Permissão negada."}, status=403)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido."}, status=400)

    report_name = data.get("name", "").strip()
    output_format = data.get("format", "pdf").lower()
    sections = data.get("sections", [])

    if not report_name:
        return JsonResponse({"error": "O nome do relatório é obrigatório."}, status=400)

    if output_format not in ("pdf", "xlsx"):
        return JsonResponse({"error": "Formato inválido. Use 'pdf' ou 'xlsx'."}, status=400)

    if not sections or not isinstance(sections, list):
        return JsonResponse({"error": "Selecione ao menos uma seção."}, status=400)

    valid = [s for s in sections if s in VALID_SECTIONS]
    if not valid:
        return JsonResponse({"error": "Nenhuma seção válida selecionada."}, status=400)

    if output_format == "xlsx":
        return _generate_xlsx(report_name, valid)
    else:
        return _generate_pdf(report_name, valid)


def _generate_xlsx(report_name, sections):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

    wb = Workbook()
    wb.remove(wb.active)

    header_font = Font(bold=True, color="FFFFFF", size=11)
    header_fill = PatternFill(start_color="2D7A73", end_color="2D7A73", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell_alignment = Alignment(vertical="center", wrap_text=True)
    thin_border = Border(
        left=Side(style="thin", color="D0E8E6"),
        right=Side(style="thin", color="D0E8E6"),
        top=Side(style="thin", color="D0E8E6"),
        bottom=Side(style="thin", color="D0E8E6"),
    )

    for section_key in sections:
        config = SECTION_CONFIG[section_key]
        ws = wb.create_sheet(title=config["label"][:31])

        for col_idx, header in enumerate(config["headers"], 1):
            cell = ws.cell(row=1, column=col_idx, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
            cell.border = thin_border

        items = config["get_data"]()
        for row_idx, item in enumerate(items, 2):
            row_data = config["row"](item)
            for col_idx, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=value)
                cell.alignment = cell_alignment
                cell.border = thin_border

        for col_idx in range(1, len(config["headers"]) + 1):
            max_length = len(str(config["headers"][col_idx - 1]))
            for row in ws.iter_rows(min_row=2, min_col=col_idx, max_col=col_idx):
                for cell in row:
                    if cell.value:
                        max_length = max(max_length, min(len(str(cell.value)), 50))
            ws.column_dimensions[ws.cell(row=1, column=col_idx).column_letter].width = max_length + 4

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    safe_name = report_name.replace(" ", "_")
    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = f'attachment; filename="{safe_name}.xlsx"'
    return response


def _generate_pdf(report_name, sections):
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )
    styles = getSampleStyleSheet()
    elements = []

    title_style = styles["Title"]
    title_style.textColor = colors.HexColor("#2D7A73")
    elements.append(Paragraph(report_name, title_style))

    subtitle_style = styles["Normal"].clone("subtitle")
    subtitle_style.textColor = colors.HexColor("#6B9591")
    subtitle_style.fontSize = 10
    generated_at = datetime.now().strftime("%d/%m/%Y às %H:%M")
    elements.append(Paragraph(f"Gerado em {generated_at}", subtitle_style))
    elements.append(Spacer(1, 0.8 * cm))

    header_color = colors.HexColor("#2D7A73")
    header_text_color = colors.white
    border_color = colors.HexColor("#D0E8E6")
    alt_row_color = colors.HexColor("#F5F9F8")

    cell_style = styles["Normal"].clone("cell")
    cell_style.fontSize = 8
    cell_style.leading = 10

    header_cell_style = styles["Normal"].clone("header_cell")
    header_cell_style.fontSize = 8
    header_cell_style.leading = 10
    header_cell_style.textColor = header_text_color
    header_cell_style.fontName = "Helvetica-Bold"

    for section_key in sections:
        config = SECTION_CONFIG[section_key]

        section_title_style = styles["Heading2"].clone(f"section_{section_key}")
        section_title_style.textColor = colors.HexColor("#2D7A73")
        section_title_style.fontSize = 14
        elements.append(Paragraph(config["label"], section_title_style))
        elements.append(Spacer(1, 0.3 * cm))

        items = list(config["get_data"]())

        if not items:
            empty_style = styles["Normal"].clone(f"empty_{section_key}")
            empty_style.textColor = colors.HexColor("#6B9591")
            elements.append(Paragraph("Nenhum registro encontrado.", empty_style))
            elements.append(Spacer(1, 0.6 * cm))
            continue

        table_data = [[Paragraph(h, header_cell_style) for h in config["headers"]]]
        for item in items:
            row = config["row"](item)
            table_data.append([Paragraph(str(v), cell_style) for v in row])

        num_cols = len(config["headers"])
        available_width = landscape(A4)[0] - 3 * cm
        col_width = available_width / num_cols

        table = Table(table_data, colWidths=[col_width] * num_cols, repeatRows=1)
        style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), header_color),
            ("TEXTCOLOR", (0, 0), (-1, 0), header_text_color),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]

        for i in range(1, len(table_data)):
            if i % 2 == 0:
                style_commands.append(("BACKGROUND", (0, i), (-1, i), alt_row_color))

        table.setStyle(TableStyle(style_commands))
        elements.append(table)
        elements.append(Spacer(1, 0.8 * cm))

    doc.build(elements)
    buffer.seek(0)

    safe_name = report_name.replace(" ", "_")
    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{safe_name}.pdf"'
    return response
