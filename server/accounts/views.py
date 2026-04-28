import json

from django.utils.dateparse import parse_date
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .verification import send_invitation_email
from .models import Invitation
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
        "bio_pt",
        "bio_en",
        "birthdate",
        "is_public",
    ]

    bilingual_fields = {"bio_pt", "bio_en"}

    for field in allowed_fields:
        if field in data:
            new_value = data.get(field)

            if field == "birthdate" and new_value:
                new_value = parse_date(new_value)
            elif field in bilingual_fields:
                new_value = new_value or ""

            current_value = getattr(user, field)
            if current_value != new_value:
                setattr(user, field, new_value)
                updated = True

    if "position_ids" in data:
        position_ids = data.get("position_ids") or []
        if not isinstance(position_ids, list):
            return JsonResponse({"error": "Invalid position_ids."}, status=400)

        positions = list(Position.objects.filter(id__in=position_ids))
        found_ids = {position.id for position in positions}
        invalid_ids = [position_id for position_id in position_ids if position_id not in found_ids]
        if invalid_ids:
            return JsonResponse({"error": "Some positions were not found."}, status=404)

        current_ids = set(user.positions.values_list("id", flat=True))
        new_ids = set(position_ids)
        if current_ids != new_ids:
            user.positions.set(positions)
            updated = True

        primary_position = positions[0] if positions else None
        if user.position != primary_position:
            user.position = primary_position
            updated = True
    elif "position_id" in data:
        position_id = data.get("position_id")
        if position_id:
            try:
                position = Position.objects.get(id=position_id)
                if user.position != position:
                    user.position = position
                    updated = True
                user.positions.set([position])
                updated = True
            except Position.DoesNotExist:
                pass
        else:
            if user.position is not None:
                user.position = None
                updated = True
            if user.positions.exists():
                user.positions.clear()
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
    unapproved_users = User.objects.filter(is_approved=False, email_validated=True).prefetch_related("positions")
    users_data = [user.export() for user in unapproved_users]
    return JsonResponse({"users": users_data}, safe=False)


@login_required
@require_http_methods(["GET"])
def list_approved_users(request):
    approved_users = User.objects.filter(is_approved=True).prefetch_related("positions")
    users_data = [user.export() for user in approved_users]
    return JsonResponse({"users": users_data}, safe=False)


@require_http_methods(["GET"])
def list_researchers(request):
    all_users = User.objects.filter(
        is_approved=True,
        is_public=True,
        show_in_researchers=True,
    ).prefetch_related("positions").order_by("researcher_order", "name")
    
    researcher_roles = ["professor", "collaborator", "student"]
    researchers = [user for user in all_users if user.has_any_role(researcher_roles)]
    
    users_data = [user.export() for user in researchers]
    return JsonResponse({"users": users_data}, safe=False)


@login_required
@require_http_methods(["GET"])
def list_all_researchers(request):
    all_users = User.objects.filter(
        is_approved=True,
    ).prefetch_related("positions").order_by("researcher_order", "name")
    
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
    
    name_pt = (data.get("name_pt") or "").strip()
    name_en = (data.get("name_en") or "").strip()
    if not name_pt and not name_en:
        return JsonResponse({"error": "Name is required."}, status=400)

    position = Position.objects.create(name_pt=name_pt, name_en=name_en)
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
    
    if "name_pt" in data:
        position.name_pt = (data.get("name_pt") or "").strip()
    if "name_en" in data:
        position.name_en = (data.get("name_en") or "").strip()
    if "order" in data:
        position.order = data["order"]
    if "is_visible" in data:
        position.is_visible = bool(data["is_visible"])
    
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
    
    users = User.objects.select_related("position", "room").prefetch_related("positions").all().order_by("name")
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
    
    if "position_ids" in data:
        position_ids = data["position_ids"] or []
        if not isinstance(position_ids, list):
            return JsonResponse({"error": "Invalid position_ids."}, status=400)

        positions = list(Position.objects.filter(id__in=position_ids))
        found_ids = {position.id for position in positions}
        invalid_ids = [position_id for position_id in position_ids if position_id not in found_ids]
        if invalid_ids:
            return JsonResponse({"error": "Some positions were not found."}, status=404)

        user.positions.set(positions)
        user.position = positions[0] if positions else None
    elif "position_id" in data:
        position_id = data["position_id"]
        if position_id:
            try:
                position = Position.objects.get(id=position_id)
                user.position = position
                user.positions.set([position])
            except Position.DoesNotExist:
                return JsonResponse({"error": "Position not found."}, status=404)
        else:
            user.position = None
            user.positions.clear()
    
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


@login_required
@require_http_methods(["POST"])
def create_invitation(request):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    
    email = data.get("email", "").lower().strip()
    roles = data.get("roles", [])
    
    if not email:
        return JsonResponse({"error": "Email is required."}, status=400)
    
    if not roles or not isinstance(roles, list):
        return JsonResponse({"error": "At least one role is required."}, status=400)
    
    valid_roles = ["professor", "student", "collaborator", "inventory_manager"]
    for role in roles:
        if role not in valid_roles:
            return JsonResponse({"error": f"Invalid role: {role}"}, status=400)
    
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "A user with this email already exists."}, status=400)
    
    existing = Invitation.objects.filter(email=email, is_used=False).first()
    if existing and existing.is_valid:
        return JsonResponse({
            "error": "A valid invitation already exists for this email."
        }, status=400)
    
    invitation = Invitation.objects.create(
        email=email,
        roles=roles,
        name=data.get("name", ""),
        phone=data.get("phone", ""),
        lattes=data.get("lattes", ""),
        bio=data.get("bio", ""),
        invited_by=request.user,
    )
    
    position_ids = data.get("position_ids", [])
    if position_ids:
        positions = Position.objects.filter(id__in=position_ids)
        invitation.positions.set(positions)
    
    try:
        send_invitation_email(invitation)
    except Exception as e:
        invitation.delete()
        return JsonResponse({"error": f"Failed to send invitation email: {str(e)}"}, status=500)
    
    return JsonResponse({
        "success": True,
        "message": "Invitation sent successfully.",
        "data": invitation.export()
    })


@login_required
@require_http_methods(["GET"])
def list_invitations(request):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    invitations = Invitation.objects.all()
    return JsonResponse({
        "success": True,
        "data": [inv.export() for inv in invitations]
    })


@require_http_methods(["GET"])
def validate_invitation(request, token):
    try:
        invitation = Invitation.objects.get(token=token)
    except Invitation.DoesNotExist:
        return JsonResponse({"error": "Invalid invitation.", "valid": False}, status=404)
    
    if invitation.is_used:
        return JsonResponse({"error": "This invitation has already been used.", "valid": False}, status=400)
    
    if invitation.is_expired:
        return JsonResponse({"error": "This invitation has expired.", "valid": False}, status=400)
    
    return JsonResponse({
        "success": True,
        "valid": True,
        "data": {
            "email": invitation.email,
            "roles": invitation.roles,
            "name": invitation.name,
            "phone": invitation.phone,
            "lattes": invitation.lattes,
            "bio": invitation.bio,
            "positions": [p.export() for p in invitation.positions.all()],
        }
    })


@login_required
@require_http_methods(["DELETE"])
def delete_invitation(request, invitation_id):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        return JsonResponse({"error": "Invitation not found."}, status=404)
    
    invitation.delete()
    return JsonResponse({"success": True, "message": "Invitation deleted."})


@login_required
@require_http_methods(["POST"])
def resend_invitation(request, invitation_id):
    if not request.user.has_role("professor"):
        return JsonResponse({"error": "Permission denied."}, status=403)
    
    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        return JsonResponse({"error": "Invitation not found."}, status=404)
    
    if invitation.is_used:
        return JsonResponse({"error": "This invitation has already been used."}, status=400)
    
    from django.utils import timezone
    if invitation.is_expired:
        invitation.expires_at = timezone.now() + timezone.timedelta(days=7)
        invitation.save()
    
    try:
        send_invitation_email(invitation)
    except Exception as e:
        return JsonResponse({"error": f"Failed to send email: {str(e)}"}, status=500)
    
    return JsonResponse({
        "success": True,
        "message": "Invitation email resent.",
        "data": invitation.export()
    })
