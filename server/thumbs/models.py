import os

from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from contents.models import ContentKind

import utils


class Thumbnail(models.Model):
    THUMB_REDUCTION = 4
    THUMB_WIDTH = int(1280 / THUMB_REDUCTION)
    THUMB_HEIGHT = int(720 / THUMB_REDUCTION)
    LARGE_THUMB_REDUCTION = 2
    LARGE_THUMB_WIDTH = int(1280 / THUMB_REDUCTION)
    LARGE_THUMB_HEIGHT = int(720 / THUMB_REDUCTION)

    storage = FileSystemStorage(settings.THUMB_ROOT)

    @classmethod
    def name(cls, name, large=False):
        name, ext = os.path.splitext(name)
        new_ext = ".jpg"

        if ext in [".png", ".gif"]:
            new_ext = ".png"

        if large:
            name = f"{name}_large"

        return name + new_ext

    @classmethod
    def path(cls, name):
        return cls.storage.path(cls.name(name))

    @classmethod
    def save_content_thumbnail(cls, content, large=False, force=False):
        name = cls.name(content.blob.path, large=large)

        if cls.storage.exists(name) and not force:
            return name

        width = cls.THUMB_WIDTH if not large else cls.LARGE_THUMB_WIDTH

        if content.kind == ContentKind.FILE_IMAGE:
            size = f"{width}x{width}"

            with utils.atomic_file(cls.path(name)) as f:
                utils.run_process(
                    [
                        "gm",
                        "convert",
                        "-size",
                        size,
                        content.blob.fullpath,
                        "-resize",
                        size,
                        "+profile",
                        '"*"',
                        f.name,
                    ],
                    timeout=5,
                )

        return name

    @classmethod
    def save_blob_thumbnail(cls, blob, large=False, force=False):
        name = cls.name(blob.path, large=large)

        if cls.storage.exists(name) and not force:
            return name

        width = cls.THUMB_WIDTH if not large else cls.LARGE_THUMB_WIDTH

        print(blob.fullpath)

        if ContentKind.from_filename(name) == ContentKind.FILE_IMAGE:
            size = f"{width}x{width}"

            with utils.atomic_file(cls.path(name)) as f:
                utils.run_process(
                    [
                        "gm",
                        "convert",
                        "-size",
                        size,
                        blob.fullpath,
                        "-resize",
                        size,
                        "+profile",
                        '"*"',
                        f.name,
                    ],
                    timeout=5,
                )

        return name
