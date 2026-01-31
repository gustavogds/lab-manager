import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Max

from .models import ResearchArea, Project


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


# ========== PROJECTS ENDPOINTS ==========


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

    # Add members if provided
    if members:
        from accounts.models import User
        try:
            user_objects = User.objects.filter(id__in=members, is_approved=True)
            project.members.set(user_objects)
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
                # Handle members separately (it's a M2M field)
                new_members = data[field]
                if isinstance(new_members, list):
                    from accounts.models import User
                    try:
                        user_objects = User.objects.filter(id__in=new_members, is_approved=True)
                        project.members.set(user_objects)
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
