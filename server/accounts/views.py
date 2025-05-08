import json

from django.utils.dateparse import parse_date
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


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
