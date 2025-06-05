import json

from django.utils.dateparse import parse_date
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import User


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

    if updated:
        user.save()
        return JsonResponse(
            {"success": True, "message": "User profile successfully updated"}
        )
    return JsonResponse({"success": False, "message": "No changes made."})


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
    unapproved_users = User.objects.filter(is_approved=False)
    users_data = [user.export() for user in unapproved_users]
    return JsonResponse({"users": users_data}, safe=False)
