import os
from django.conf import settings


def make_required_dirs():
    from utils import safe_makedirs

    safe_makedirs(settings.FILE_UPLOAD_TEMP_ROOT)
    roots = map(os.path.abspath, [settings.CONTENT_ROOT, settings.THUMB_ROOT])

    for root in roots:
        for i in range(256):
            safe_makedirs(os.path.join(root, f"{i:02x}"))
