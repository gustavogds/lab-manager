import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Max

from .models import ResearchArea, Project, Partnership, Equipment, Room, IdentificationCategory, EquipmentState
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
    observation = data.get("observation", "").strip()
    room_id = data.get("room_id")
    identification_category_id = data.get("identification_category_id")
    equipment_state_id = data.get("equipment_state_id")

    if not name:
        return JsonResponse({"error": "Nome é obrigatório."}, status=400)

    if not custom_id:
        return JsonResponse({"error": "ID do equipamento é obrigatório."}, status=400)

    if Equipment.objects.filter(custom_id=custom_id).exists():
        return JsonResponse({"error": "Já existe um equipamento com este ID."}, status=400)

    room = None
    if room_id:
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return JsonResponse({"error": "Sala não encontrada."}, status=404)

    identification_category = None
    if identification_category_id:
        try:
            identification_category = IdentificationCategory.objects.get(id=identification_category_id)
        except IdentificationCategory.DoesNotExist:
            return JsonResponse({"error": "Categoria de identificação não encontrada."}, status=404)

    equipment_state = None
    if equipment_state_id:
        try:
            equipment_state = EquipmentState.objects.get(id=equipment_state_id)
        except EquipmentState.DoesNotExist:
            return JsonResponse({"error": "Estado do equipamento não encontrado."}, status=404)

    max_order = Equipment.objects.aggregate(Max("order"))["order__max"] or 0

    equipment = Equipment.objects.create(
        name=name,
        custom_id=custom_id,
        observation=observation,
        identification_category=identification_category,
        equipment_state=equipment_state,
        room=room,
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
        items = Equipment.objects.select_related("room", "assigned_to").prefetch_related("users").all()
    else:
        items = Equipment.objects.select_related("room", "assigned_to").prefetch_related("users").filter(is_active=True)

    return JsonResponse(
        {
            "success": True,
            "data": [item.export() for item in items],
        }
    )


@login_required
@require_http_methods(["GET"])
def list_all_equipment(request):
    items = Equipment.objects.select_related("room", "assigned_to").prefetch_related("users").all()
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

    allowed_fields = ["name", "custom_id", "observation", "is_active", "order"]
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

    if "room_id" in data:
        room_id = data["room_id"]
        if room_id is None:
            if equipment.room is not None:
                equipment.room = None
                updated = True
        else:
            try:
                room = Room.objects.get(id=room_id)
                if equipment.room_id != room.id:
                    equipment.room = room
                    updated = True
            except Room.DoesNotExist:
                return JsonResponse({"error": "Sala não encontrada."}, status=404)

    if "identification_category_id" in data:
        category_id = data["identification_category_id"]
        if category_id is None:
            if equipment.identification_category is not None:
                equipment.identification_category = None
                updated = True
        else:
            try:
                category = IdentificationCategory.objects.get(id=category_id)
                if equipment.identification_category_id != category.id:
                    equipment.identification_category = category
                    updated = True
            except IdentificationCategory.DoesNotExist:
                return JsonResponse({"error": "Categoria de identificação não encontrada."}, status=404)

    if "equipment_state_id" in data:
        state_id = data["equipment_state_id"]
        if state_id is None:
            if equipment.equipment_state is not None:
                equipment.equipment_state = None
                updated = True
        else:
            try:
                state = EquipmentState.objects.get(id=state_id)
                if equipment.equipment_state_id != state.id:
                    equipment.equipment_state = state
                    updated = True
            except EquipmentState.DoesNotExist:
                return JsonResponse({"error": "Estado do equipamento não encontrado."}, status=404)

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

    if "users" in data:
        new_users = data["users"]
        if isinstance(new_users, list):
            try:
                user_objects = User.objects.filter(id__in=new_users, is_approved=True)
                approved_ids = set(user_objects.values_list("id", flat=True))
                ordered_users = []
                seen_ids = set()
                for uid in new_users:
                    if uid in approved_ids and uid not in seen_ids:
                        ordered_users.append(uid)
                        seen_ids.add(uid)
                equipment.users.set(user_objects)
                equipment.users_order = ordered_users
                updated = True
            except Exception:
                pass

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
        room_id = config.get("room_id")

        try:
            equipment = Equipment.objects.get(id=equipment_id)
            if order is not None:
                equipment.order = order
            if is_active is not None:
                equipment.is_active = is_active
            if room_id is not None:
                try:
                    room = Room.objects.get(id=room_id)
                    equipment.room = room
                except Room.DoesNotExist:
                    pass
            elif "room_id" in config:
                equipment.room = None
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


@login_required
@require_http_methods(["POST"])
def create_room(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    name = data.get("name", "").strip()

    if not name:
        return JsonResponse({"error": "Nome é obrigatório."}, status=400)

    max_order = Room.objects.aggregate(Max("order"))["order__max"] or 0

    room = Room.objects.create(
        name=name,
        order=max_order + 1,
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Sala criada com sucesso.",
            "data": room.export(),
        }
    )


@login_required
@require_http_methods(["GET"])
def list_rooms(request):
    rooms = Room.objects.all()
    return JsonResponse(
        {
            "success": True,
            "data": [room.export() for room in rooms],
        }
    )


@login_required
@require_http_methods(["PATCH"])
def update_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return JsonResponse({"error": "Sala não encontrada."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["name", "order"]
    updated = False

    for field in allowed_fields:
        if field in data:
            new_value = data[field]
            current_value = getattr(room, field)
            if current_value != new_value:
                setattr(room, field, new_value)
                updated = True

    if updated:
        room.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Sala atualizada com sucesso.",
                "data": room.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["DELETE"])
def delete_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
        room.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Sala deletada com sucesso.",
            }
        )
    except Room.DoesNotExist:
        return JsonResponse({"error": "Sala não encontrada."}, status=404)


# Identification Category Views

@login_required
@require_http_methods(["POST"])
def create_identification_category(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    name = data.get("name", "").strip()

    if not name:
        return JsonResponse({"error": "Nome é obrigatório."}, status=400)

    max_order = IdentificationCategory.objects.aggregate(Max("order"))["order__max"] or 0

    category = IdentificationCategory.objects.create(
        name=name,
        order=max_order + 1,
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Categoria de identificação criada com sucesso.",
            "data": category.export(),
        }
    )


@login_required
@require_http_methods(["GET"])
def list_identification_categories(request):
    categories = IdentificationCategory.objects.all()
    return JsonResponse(
        {
            "success": True,
            "data": [category.export() for category in categories],
        }
    )


@login_required
@require_http_methods(["PATCH"])
def update_identification_category(request, category_id):
    try:
        category = IdentificationCategory.objects.get(id=category_id)
    except IdentificationCategory.DoesNotExist:
        return JsonResponse({"error": "Categoria não encontrada."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["name", "order"]
    updated = False

    for field in allowed_fields:
        if field in data:
            new_value = data[field]
            current_value = getattr(category, field)
            if current_value != new_value:
                setattr(category, field, new_value)
                updated = True

    if updated:
        category.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Categoria atualizada com sucesso.",
                "data": category.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["DELETE"])
def delete_identification_category(request, category_id):
    try:
        category = IdentificationCategory.objects.get(id=category_id)
        category.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Categoria deletada com sucesso.",
            }
        )
    except IdentificationCategory.DoesNotExist:
        return JsonResponse({"error": "Categoria não encontrada."}, status=404)


# Equipment State Views

@login_required
@require_http_methods(["POST"])
def create_equipment_state(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    name = data.get("name", "").strip()

    if not name:
        return JsonResponse({"error": "Nome é obrigatório."}, status=400)

    max_order = EquipmentState.objects.aggregate(Max("order"))["order__max"] or 0

    state = EquipmentState.objects.create(
        name=name,
        order=max_order + 1,
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Estado do equipamento criado com sucesso.",
            "data": state.export(),
        }
    )


@login_required
@require_http_methods(["GET"])
def list_equipment_states(request):
    states = EquipmentState.objects.all()
    return JsonResponse(
        {
            "success": True,
            "data": [state.export() for state in states],
        }
    )


@login_required
@require_http_methods(["PATCH"])
def update_equipment_state(request, state_id):
    try:
        state = EquipmentState.objects.get(id=state_id)
    except EquipmentState.DoesNotExist:
        return JsonResponse({"error": "Estado não encontrado."}, status=404)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    allowed_fields = ["name", "order"]
    updated = False

    for field in allowed_fields:
        if field in data:
            new_value = data[field]
            current_value = getattr(state, field)
            if current_value != new_value:
                setattr(state, field, new_value)
                updated = True

    if updated:
        state.save()
        return JsonResponse(
            {
                "success": True,
                "message": "Estado atualizado com sucesso.",
                "data": state.export(),
            }
        )

    return JsonResponse(
        {"success": False, "message": "Nenhuma alteração foi feita."}
    )


@login_required
@require_http_methods(["DELETE"])
def delete_equipment_state(request, state_id):
    try:
        state = EquipmentState.objects.get(id=state_id)
        state.delete()
        return JsonResponse(
            {
                "success": True,
                "message": "Estado deletado com sucesso.",
            }
        )
    except EquipmentState.DoesNotExist:
        return JsonResponse({"error": "Estado não encontrado."}, status=404)
