import json

from django.utils.dateparse import parse_date
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import User, Position


@login_required
@require_http_methods(["PATCH"])
def update_user_settings(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    user = request.user
    updated = False

    allowed_fields = [
        "name",
        "phone",
        "contact_email",
        "social_media",
        "lattes",
        "bio",
        "birthdate",
        "is_public",
    ]

    for field in allowed_fields:
        if field in data:
            new_value = data.get(field)

            if field == "birthdate" and new_value:
                new_value = parse_date(new_value)

            current_value = getattr(user, field)
            if current_value != new_value:
                setattr(user, field, new_value)
                updated = True

    if "position_id" in data:
        position_id = data.get("position_id")
        if position_id:
            try:
                position = Position.objects.get(id=position_id)
                if user.position != position:
                    user.position = position
                    updated = True
            except Position.DoesNotExist:
                pass
        else:
            if user.position is not None:
                user.position = None
                updated = True

    if updated:
        user.save()
        return JsonResponse(
            {"success": True, "message": "User profile successfully updated"}
        )
    return JsonResponse({"success": False, "message": "No changes made."})


@login_required
@require_http_methods(["POST"])
def upload_profile_image(request):
    user = request.user

    if "image" not in request.FILES:
        return JsonResponse({"error": "Missing image file."}, status=400)

    image = request.FILES["image"]
    max_size = 2 * 1024 * 1024  # 2MB

    if image.size > max_size:
        return JsonResponse(
            {"error": "Image exceeds maximum size of 2MB."}, status=400
        )

    if not image.content_type.startswith("image/"):
        return JsonResponse({"error": "Invalid file type."}, status=400)

    user.profile_image = image
    user.save()

    return JsonResponse(
        {
            "success": True,
            "message": "Profile image updated successfully.",
            "profile_image": user.profile_image.url,
        }
    )


@login_required
@require_http_methods(["POST"])
def approve_user(request):
    data = json.loads(request.body)
    user_id = data.get("id")

    if not user_id:
        return JsonResponse({"error": "Missing user ID."}, status=400)

    try:
        user = User.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return JsonResponse({"message": "User approved."})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)


@login_required
@require_http_methods(["POST"])
def reject_user(request):
    data = json.loads(request.body)
    user_id = data.get("id")

    if not user_id:
        return JsonResponse({"error": "Missing user ID."}, status=400)

    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return JsonResponse({"message": "User rejected and deleted."})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)


@login_required
@require_http_methods(["GET"])
def list_unapproved_users(request):
    unapproved_users = User.objects.filter(is_approved=False, email_validated=True)
    users_data = [user.export() for user in unapproved_users]
    return JsonResponse({"users": users_data}, safe=False)


@login_required
@require_http_methods(["GET"])
def list_approved_users(request):
    approved_users = User.objects.filter(is_approved=True)
    users_data = [user.export() for user in approved_users]
    return JsonResponse({"users": users_data}, safe=False)


@require_http_methods(["GET"])
def list_researchers(request):
    all_users = User.objects.filter(
        is_approved=True,
        is_public=True,
        show_in_researchers=True,
    ).order_by("researcher_order", "name")
    
    researcher_roles = ["professor", "collaborator", "student"]
    researchers = [user for user in all_users if user.has_any_role(researcher_roles)]
    
    users_data = [user.export() for user in researchers]
    return JsonResponse({"users": users_data}, safe=False)


@login_required
@require_http_methods(["GET"])
def list_all_researchers(request):
    all_users = User.objects.filter(
        is_approved=True,
    ).order_by("researcher_order", "name")
    
    researcher_roles = ["professor", "collaborator", "student"]
    researchers = [user for user in all_users if user.has_any_role(researcher_roles)]
    
    users_data = [user.export() for user in researchers]
    return JsonResponse({"users": users_data}, safe=False)


@login_required
@require_http_methods(["PATCH"])
def update_researchers_config(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    researchers_config = data.get("researchers", [])

    for config in researchers_config:
        user_id = config.get("id")
        order = config.get("order")
        show = config.get("show")
        is_former = config.get("is_former_member")

        try:
            user = User.objects.get(id=user_id)
            if order is not None:
                user.researcher_order = order
            if show is not None:
                user.show_in_researchers = show
            if is_former is not None:
                user.is_former_member = is_former
            user.save()
        except User.DoesNotExist:
            continue

    return JsonResponse({"success": True, "message": "Researchers updated."})


@require_http_methods(["GET"])
def list_positions(request):
    positions = Position.objects.all()
    return JsonResponse({
        "success": True,
        "data": [p.export() for p in positions]
    })


@login_required
@require_http_methods(["POST"])
def create_position(request):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    
    name = data.get("name", "").strip()
    if not name:
        return JsonResponse({"error": "Name is required."}, status=400)
    
    position = Position.objects.create(name=name)
    return JsonResponse({
        "success": True,
        "message": "Position created.",
        "data": position.export()
    })


@login_required
@require_http_methods(["PATCH"])
def update_position(request, position_id):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        position = Position.objects.get(id=position_id)
    except Position.DoesNotExist:
        return JsonResponse({"error": "Position not found."}, status=404)
    
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    
    if "name" in data:
        position.name = data["name"].strip()
    if "order" in data:
        position.order = data["order"]
    
    position.save()
    return JsonResponse({
        "success": True,
        "message": "Position updated.",
        "data": position.export()
    })


@login_required
@require_http_methods(["DELETE"])
def delete_position(request, position_id):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        position = Position.objects.get(id=position_id)
    except Position.DoesNotExist:
        return JsonResponse({"error": "Position not found."}, status=404)
    
    position.delete()
    return JsonResponse({"success": True, "message": "Position deleted."})


@login_required
@require_http_methods(["GET"])
def list_all_users(request):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    users = User.objects.select_related("position", "room").all().order_by("name")
    return JsonResponse({
        "success": True,
        "data": [u.export() for u in users]
    })


@login_required
@require_http_methods(["PATCH"])
def update_user(request, user_id):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    
    if "roles" in data:
        roles = data["roles"]
        valid_roles = ["professor", "student", "collaborator", "inventory_manager"]
        if not isinstance(roles, list) or not all(r in valid_roles for r in roles):
            return JsonResponse({"error": "Invalid roles."}, status=400)
        user.roles = roles
    
    if "position_id" in data:
        position_id = data["position_id"]
        if position_id:
            try:
                user.position = Position.objects.get(id=position_id)
            except Position.DoesNotExist:
                return JsonResponse({"error": "Position not found."}, status=404)
        else:
            user.position = None
    
    if "room_id" in data:
        room_id = data["room_id"]
        if room_id:
            from content.models import Room
            try:
                user.room = Room.objects.get(id=room_id)
            except Room.DoesNotExist:
                return JsonResponse({"error": "Room not found."}, status=404)
        else:
            user.room = None
    
    if "is_active" in data:
        user.is_active = data["is_active"]
    
    if "is_approved" in data:
        user.is_approved = data["is_approved"]
    
    user.save()
    return JsonResponse({
        "success": True,
        "message": "User updated.",
        "data": user.export()
    })


@login_required
@require_http_methods(["DELETE"])
def delete_user(request, user_id):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    if user.id == request.user.id:
        return JsonResponse({"error": "Cannot delete yourself."}, status=400)
    
    user.delete()
    return JsonResponse({"success": True, "message": "User deleted."})
