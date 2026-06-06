from .models import LabSettings


def lab_branding(request):
    favicon_url = None
    lab_name = None

    try:
        settings_obj = LabSettings.objects.only("favicon", "lab_name").first()
        if settings_obj:
            lab_name = settings_obj.lab_name
            if settings_obj.favicon:
                favicon_url = settings_obj.favicon.url
    except Exception:
        # The table may not exist yet (e.g. before the first migrate). Fail open
        # so template rendering never breaks because of branding lookup.
        pass

    return {
        "lab_favicon_url": favicon_url,
        "lab_name": lab_name,
    }
