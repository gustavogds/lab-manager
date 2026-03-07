import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max

from .models import LabSettings, AboutImage
from .forms import UploadedFileForm


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
        "address_details",
        "maps_link",
        "mission",
        "areas",
        "highlights",
        "lead",
        "team",
        "partners",
        "contact_email",
        "contact_phone",
        "home_use_gradient",
        "home_bg_color_start",
        "home_bg_color_middle",
        "home_bg_color_end",
        "home_accent_color",
        "home_border_hover_color",
        "home_icon_color",
        "home_text_color",
    ]

    updated = False

    field_mapping = {
        "email": "contact_email",
        "phone": "contact_phone",
    }

    for field in allowed_fields:
        if field in data:
            value = data[field]
            if field == "home_use_gradient":
                setattr(lab_settings, field, bool(value))
            else:
                setattr(lab_settings, field, value or None)
            updated = True

    for frontend_field, backend_field in field_mapping.items():
        if frontend_field in data:
            setattr(lab_settings, backend_field, data[frontend_field] or None)
            updated = True

    if updated:
        lab_settings.save()
        return JsonResponse(
            {"success": True, "message": "Lab settings successfully updated"}
        )

    return JsonResponse({"success": False, "message": "No changes made"})


@require_http_methods(["GET"])
def get_lab_settings(request):
    lab_settings, _ = LabSettings.objects.get_or_create(pk=1)
    return JsonResponse(lab_settings.export())


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def file_upload(request):
    form = UploadedFileForm(request.POST, request.FILES)
    if form.is_valid():
        uploaded_file = form.save()
        return JsonResponse(
            {
                "success": True,
                "file_url": uploaded_file.file.url,
                "uploaded_at": uploaded_file.uploaded_at,
            }
        )
    return JsonResponse({"success": False, "errors": form.errors}, status=400)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def upload_lab_logo(request):
    if "logo" not in request.FILES:
        return JsonResponse({"error": "No file uploaded."}, status=400)

    logo = request.FILES["logo"]
    max_size = 2 * 1024 * 1024  # 2MB

    if logo.size > max_size:
        return JsonResponse(
            {"error": "Logo exceeds maximum size of 2MB."}, status=400
        )

    if not logo.content_type.startswith("image/"):
        return JsonResponse({"error": "Invalid file type."}, status=400)

    lab_settings, _ = LabSettings.objects.get_or_create(pk=1)
    lab_settings.logo = logo
    lab_settings.save()

    return JsonResponse(
        {
            "success": True,
            "message": "Logo uploaded successfully.",
            "logo_url": lab_settings.logo.url,
        }
    )


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def upload_about_image(request):
    if "image" not in request.FILES:
        return JsonResponse({"error": "No image uploaded."}, status=400)

    lab_settings, _ = LabSettings.objects.get_or_create(pk=1)
    
    max_order = AboutImage.objects.filter(lab_settings=lab_settings).aggregate(
        Max("order")
    )["order__max"] or 0
    
    about_image = AboutImage.objects.create(
        lab_settings=lab_settings,
        image=request.FILES["image"],
        order=max_order + 1
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Image uploaded successfully.",
            "image": {
                "id": about_image.id,
                "image": about_image.image.url,
                "order": about_image.order
            }
        }
    )


@login_required
@require_http_methods(["DELETE"])
def delete_about_image(request, image_id):
    try:
        about_image = AboutImage.objects.get(id=image_id)
        about_image.delete()
        return JsonResponse(
            {"success": True, "message": "Image deleted successfully."}
        )
    except AboutImage.DoesNotExist:
        return JsonResponse({"error": "Image not found."}, status=404)
