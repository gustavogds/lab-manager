import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import LabSettings


@login_required
@require_http_methods(["PATCH"])
def update_lab_settings(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    lab_settings, _ = LabSettings.objects.get_or_create(pk=1)

    allowed_fields = [
        "lab_name",
        "address",
        "mission",
        "contact_email",
        "contact_phone",
        # "logo" vai precisar do upload de arquivos implementado
    ]

    updated = False

    for field in allowed_fields:
        if field in data:
            setattr(lab_settings, field, data[field] or None)
            updated = True

    if updated:
        lab_settings.save()
        return JsonResponse(
            {"success": True, "message": "Lab settings successfully updated"}
        )

    return JsonResponse({"success": False, "message": "No changes made"})


@login_required
@require_http_methods(["GET"])
def get_lab_settings(request):
    lab_settings, _ = LabSettings.objects.get_or_create(pk=1)
    return JsonResponse(lab_settings.export())
