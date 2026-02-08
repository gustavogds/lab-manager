import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Max

from .models import ResearchArea, Project, Partnership, Equipment
from accounts.models import User


@login_required
@require_http_methods(["POST"])
def create_research_area(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return JsonResponse({"error": "Title is required."}, status=400)

    if not description:
        return JsonResponse({"error": "Description is required."}, status=400)

    max_order = ResearchArea.objects.aggregate(Max("order"))["order__max"] or 0

    research_area = ResearchArea.objects.create(
        title=title,
        description=description,
        order=max_order + 1,
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Área de pesquisa criada com sucesso.",
            "data": research_area.export(),
        }
    )


@require_http_methods(["GET"])
def list_research_areas(request):
    if request.user.is_authenticated and hasattr(request.user, "role") and request.user.role == "professor":
        areas = ResearchArea.objects.all()
    else:
        areas = ResearchArea.objects.filter(is_active=True)

    return JsonResponse(
        {
            "success": True,
            "data": [area.export() for area in areas],
        }
    )


@login_required
@require_http_methods(["GET"])
def get_research_area(request, area_id):
    try:
        area = ResearchArea.objects.get(id=area_id)
        return JsonResponse(
            {
                "success": True,
                "data": area.export(),
            }
        )
    except ResearchArea.DoesNotExist:
        return JsonResponse({"error": "Research area not found."}, status=404)


@login_required
@require_http_methods(["PATCH"])
def update_research_area(request, area_id):
    try:
        area = ResearchArea.objects.get(id=area_id)
    except ResearchArea.DoesNotExist:
        return JsonResponse({"error": "Research area not found."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["title", "description", "is_active", "order"]
    updated = False

    for field in allowed_fields:
        if field in data:
            new_value = data[field]
            current_value = getattr(area, field)
            if current_value != new_value:
                setattr(area, field, new_value)
                updated = True

    if updated:
        area.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Área de pesquisa atualizada com sucesso.",
                "data": area.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["DELETE"])
def delete_research_area(request, area_id):
    try:
        area = ResearchArea.objects.get(id=area_id)
        area.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Área de pesquisa deletada com sucesso.",
            }
        )
    except ResearchArea.DoesNotExist:
        return JsonResponse({"error": "Research area not found."}, status=404)


@login_required
@require_http_methods(["POST"])
def create_project(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    members = data.get("members", [])

    if not title:
        return JsonResponse({"error": "Title is required."}, status=400)

    if not description:
        return JsonResponse({"error": "Description is required."}, status=400)

    max_order = Project.objects.aggregate(Max("order"))["order__max"] or 0

    project = Project.objects.create(
        title=title,
        description=description,
        order=max_order + 1,
    )

    if members:
        from accounts.models import User
        try:
            user_objects = User.objects.filter(id__in=members, is_approved=True)
            approved_ids = set(user_objects.values_list("id", flat=True))
            ordered_members = []
            seen_ids = set()
            for member_id in members:
                if member_id in approved_ids and member_id not in seen_ids:
                    ordered_members.append(member_id)
                    seen_ids.add(member_id)
            project.members.set(user_objects)
            project.members_order = ordered_members
            project.save(update_fields=["members_order"])
        except Exception:
            pass

    return JsonResponse(
        {
            "success": True,
            "message": "Projeto criado com sucesso.",
            "data": project.export(),
        }
    )


@require_http_methods(["GET"])
def list_projects(request):
    if request.user.is_authenticated and hasattr(request.user, "role") and request.user.role == "professor":
        projects = Project.objects.all()
    else:
        projects = Project.objects.filter(is_active=True)

    return JsonResponse(
        {
            "success": True,
            "data": [project.export() for project in projects],
        }
    )


@login_required
@require_http_methods(["GET"])
def get_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        return JsonResponse(
            {
                "success": True,
                "data": project.export(),
            }
        )
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found."}, status=404)


@login_required
@require_http_methods(["PATCH"])
def update_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["title", "description", "is_active", "order", "members"]
    updated = False

    for field in allowed_fields:
        if field in data:
            if field == "members":
                new_members = data[field]
                if isinstance(new_members, list):
                    from accounts.models import User
                    try:
                        user_objects = User.objects.filter(id__in=new_members, is_approved=True)
                        approved_ids = set(user_objects.values_list("id", flat=True))
                        ordered_members = []
                        seen_ids = set()
                        for member_id in new_members:
                            if member_id in approved_ids and member_id not in seen_ids:
                                ordered_members.append(member_id)
                                seen_ids.add(member_id)
                        project.members.set(user_objects)
                        project.members_order = ordered_members
                        updated = True
                    except Exception:
                        pass
            else:
                new_value = data[field]
                current_value = getattr(project, field)
                if current_value != new_value:
                    setattr(project, field, new_value)
                    updated = True

    if updated:
        project.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Projeto atualizado com sucesso.",
                "data": project.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["DELETE"])
def delete_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        project.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Projeto deletado com sucesso.",
            }
        )
    except Project.DoesNotExist:
        return JsonResponse({"error": "Project not found."}, status=404)


@login_required
@require_http_methods(["POST"])
def create_partnership(request):
    if "logo" not in request.FILES:
        return JsonResponse({"error": "Logo is required."}, status=400)

    name = request.POST.get("name", "").strip()
    link = request.POST.get("link", "").strip() or None
    logo = request.FILES["logo"]

    if not name:
        return JsonResponse({"error": "Name is required."}, status=400)

    max_size = 2 * 1024 * 1024
    if logo.size > max_size:
        return JsonResponse({"error": "Logo must be less than 2MB."}, status=400)

    if not logo.content_type.startswith("image/"):
        return JsonResponse({"error": "Invalid file type."}, status=400)

    max_order = Partnership.objects.aggregate(Max("order"))["order__max"] or 0

    partnership = Partnership.objects.create(
        name=name,
        logo=logo,
        link=link,
        order=max_order + 1,
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Parceria criada com sucesso.",
            "data": partnership.export(),
        }
    )


@require_http_methods(["GET"])
def list_partnerships(request):
    if request.user.is_authenticated and hasattr(request.user, "role") and request.user.role == "professor":
        partnerships = Partnership.objects.all()
    else:
        partnerships = Partnership.objects.filter(is_active=True)

    return JsonResponse(
        {
            "success": True,
            "data": [p.export() for p in partnerships],
        }
    )


@login_required
@require_http_methods(["GET"])
def list_all_partnerships(request):
    partnerships = Partnership.objects.all()
    return JsonResponse(
        {
            "success": True,
            "data": [p.export() for p in partnerships],
        }
    )


@login_required
@require_http_methods(["PATCH"])
def update_partnership(request, partnership_id):
    try:
        partnership = Partnership.objects.get(id=partnership_id)
    except Partnership.DoesNotExist:
        return JsonResponse({"error": "Partnership not found."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["name", "link", "is_active", "order"]
    updated = False

    for field in allowed_fields:
        if field in data:
            new_value = data[field]
            current_value = getattr(partnership, field)
            if current_value != new_value:
                setattr(partnership, field, new_value)
                updated = True

    if updated:
        partnership.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Parceria atualizada com sucesso.",
                "data": partnership.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["PATCH"])
def update_partnerships_config(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    partnerships_config = data.get("partnerships", [])

    for config in partnerships_config:
        partnership_id = config.get("id")
        order = config.get("order")
        is_active = config.get("is_active")

        try:
            partnership = Partnership.objects.get(id=partnership_id)
            if order is not None:
                partnership.order = order
            if is_active is not None:
                partnership.is_active = is_active
            partnership.save()
        except Partnership.DoesNotExist:
            continue

    return JsonResponse({"success": True, "message": "Parcerias atualizadas."})


@login_required
@require_http_methods(["DELETE"])
def delete_partnership(request, partnership_id):
    try:
        partnership = Partnership.objects.get(id=partnership_id)
        partnership.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Parceria deletada com sucesso.",
            }
        )
    except Partnership.DoesNotExist:
        return JsonResponse({"error": "Partnership not found."}, status=404)


@login_required
@require_http_methods(["POST"])
def create_equipment(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    name = data.get("name", "").strip()
    custom_id = data.get("custom_id", "").strip()
    location = data.get("location", "").strip() or None

    if not name:
        return JsonResponse({"error": "Nome é obrigatório."}, status=400)

    if not custom_id:
        return JsonResponse({"error": "ID do equipamento é obrigatório."}, status=400)

    if Equipment.objects.filter(custom_id=custom_id).exists():
        return JsonResponse({"error": "Já existe um equipamento com este ID."}, status=400)

    max_order = Equipment.objects.aggregate(Max("order"))["order__max"] or 0

    equipment = Equipment.objects.create(
        name=name,
        custom_id=custom_id,
        location=location,
        order=max_order + 1,
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Equipamento criado com sucesso.",
            "data": equipment.export(),
        }
    )


@require_http_methods(["GET"])
def list_equipment(request):
    if request.user.is_authenticated and hasattr(request.user, "role") and request.user.role == "professor":
        items = Equipment.objects.all()
    else:
        items = Equipment.objects.filter(is_active=True)

    return JsonResponse(
        {
            "success": True,
            "data": [item.export() for item in items],
        }
    )


@login_required
@require_http_methods(["GET"])
def list_all_equipment(request):
    items = Equipment.objects.all()
    return JsonResponse(
        {
            "success": True,
            "data": [item.export() for item in items],
        }
    )


@login_required
@require_http_methods(["PATCH"])
def update_equipment(request, equipment_id):
    try:
        equipment = Equipment.objects.get(id=equipment_id)
    except Equipment.DoesNotExist:
        return JsonResponse({"error": "Equipment not found."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["name", "custom_id", "location", "is_active", "order"]
    updated = False

    for field in allowed_fields:
        if field in data:
            new_value = data[field]
            if field == "custom_id" and new_value != equipment.custom_id:
                if Equipment.objects.filter(custom_id=new_value).exists():
                    return JsonResponse({"error": "Já existe um equipamento com este ID."}, status=400)
            current_value = getattr(equipment, field)
            if current_value != new_value:
                setattr(equipment, field, new_value)
                updated = True

    if "assigned_to" in data:
        assigned_to_id = data["assigned_to"]
        if assigned_to_id is None:
            if equipment.assigned_to is not None:
                equipment.assigned_to = None
                updated = True
        else:
            try:
                user = User.objects.get(id=assigned_to_id)
                if equipment.assigned_to_id != user.id:
                    equipment.assigned_to = user
                    updated = True
            except User.DoesNotExist:
                return JsonResponse({"error": "Usuário não encontrado."}, status=404)

    if updated:
        equipment.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Equipamento atualizado com sucesso.",
                "data": equipment.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["PATCH"])
def update_equipment_config(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    equipment_config = data.get("equipment", [])

    for config in equipment_config:
        equipment_id = config.get("id")
        order = config.get("order")
        is_active = config.get("is_active")

        try:
            equipment = Equipment.objects.get(id=equipment_id)
            if order is not None:
                equipment.order = order
            if is_active is not None:
                equipment.is_active = is_active
            equipment.save()
        except Equipment.DoesNotExist:
            continue

    return JsonResponse({"success": True, "message": "Equipamentos atualizados."})


@login_required
@require_http_methods(["DELETE"])
def delete_equipment(request, equipment_id):
    try:
        equipment = Equipment.objects.get(id=equipment_id)
        equipment.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Equipamento deletado com sucesso.",
            }
        )
    except Equipment.DoesNotExist:
        return JsonResponse({"error": "Equipment not found."}, status=404)
