import enum
import os
import datetime
import hashlib

from django.db import models, connection
from django.utils import timezone
from django.contrib.postgres import fields as pg_fields
from django.db.models.expressions import RawSQL
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from PIL import Image

from sitewide import guids


class ContentKind(models.IntegerChoices):
    FOLDER = 1
    FILE_IMAGE = 2
    POST = 3

    @classmethod
    def from_filename(cls, filename):
        ext = os.path.splitext(filename)[1].lower()

        if ext in (".jpg", ".jpeg", ".png", ".gif"):
            return cls.FILE_IMAGE


class Blob(models.Model):
    path: str = models.TextField(unique=True)
    thumb_path: str = models.TextField(blank=True, null=True)
    size: int = models.IntegerField()
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    meta: dict = models.JSONField(blank=True, null=True)

    @property
    def hash(self):
        return f"{self.path[:2]}{self.path[2:]}"

    @property
    def ext(self):
        return os.path.splitext(self.path)[1]

    @property
    def fullpath(self):
        return Content.storage.fs.path(self.path)

    @classmethod
    def probe_file_meta(cls, data, kind, ext):
        meta = {}

        if kind == ContentKind.FILE_IMAGE:
            with Image.open(data.file) as img:
                meta["width"], meta["height"] = img.size

        return meta

    def export(self):
        return {
            "thumb_path": self.thumb_path,
            "size": self.size,
            "meta": self.meta,
        }


class ContentManager(models.Manager):
    def move(self, source, destination):
        if source.pk == destination.pk or set(source.path).issubset(destination.path):
            raise ValidationError("Invalid move operation")

        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE contents_content
                SET path = %s || path[%s:array_length(path, 1)]
                WHERE path && ARRAY[%s]
                """,
                [destination.path, len(source.path), source.pk],
            )


class ContentQuerySet(models.QuerySet):
    def for_user(self, user):
        queryset = self
        return queryset.filter(
            path__overlap=RawSQL(
                """ARRAY(SELECT "contents_mount"."content_id" FROM "contents_mount" WHERE "user_id" = %s)""",
                [user.id],
            )
        )


class ContentStorage:
    def __init__(self):
        self.fs = FileSystemStorage(settings.CONTENT_ROOT)

    @classmethod
    def get_sha(cls, data):
        hasher = hashlib.sha1()

        for chunk in data.chunks():
            hasher.update(chunk)

        return hasher.hexdigest()

    @classmethod
    def get_blob_path(cls, digest, ext):
        return f"{digest[:2]}/{digest[2:]}{ext}"

    def save_blob(self, data, kind, ext, meta=None, digest=None):
        if meta is None:
            meta = {}

        if digest is None:
            digest = self.get_sha(data)

        blob_path = self.get_blob_path(digest, ext)
        blob = Blob.objects.filter(path=blob_path).first()

        if not blob:
            blob_meta = Blob.probe_file_meta(data, kind, ext.lower())
            blob_meta.update(meta)

            if not self.fs.exists(blob_path):
                self.fs.save(blob_path, data)

            blob, _ = Blob.objects.get_or_create(
                path=blob_path, defaults={"size": data.size, "meta": blob_meta}
            )

            blob.save()

        return blob

    def save(self, parent, data, name, kind=None, meta=None):
        if meta is None:
            meta = {}

        if kind is None:
            kind = ContentKind.from_filename(name)

        if not kind:
            raise ValidationError("Could not determine content kind")

        ext = os.path.splitext(name)[1].lower()
        digest = self.get_sha(data)
        blob = self.save_blob(data, kind, ext, meta, digest)

        content = Content.objects.create(
            path=getattr(parent, "path", []), name=name, kind=kind, meta=meta, blob=blob
        )

        data.close()

        return content


class Content(models.Model):
    blob: Blob = models.ForeignKey(
        Blob, on_delete=models.CASCADE, blank=True, null=True
    )
    name: str = models.TextField()
    guid: str = models.TextField(unique=True, blank=True, null=True)
    path: list = pg_fields.ArrayField(base_field=models.IntegerField())
    kind: int = models.IntegerField(choices=ContentKind.choices)
    visible: bool = models.BooleanField(default=True)
    meta: dict = models.JSONField(blank=True, null=True)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    modified_at: datetime.datetime = models.DateTimeField(default=timezone.now)

    objects = ContentManager.from_queryset(ContentQuerySet)()
    storage = ContentStorage()

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def export(self):
        return {
            "name": self.name,
            "guid": self.guid,
            "path": self.path,
            "kind": self.kind,
            "visible": self.visible,
            "meta": self.meta,
            "created_at": self.created_at.isoformat(),
            "modified_at": self.modified_at.isoformat(),
        }

    @classmethod
    def make_guid(cls, pk):
        return guids.encode(guids.CONTENT, pk)

    @classmethod
    def decode_guid(cls, guid):
        guid = guids.decode(guid, guids.CONTENT)

        if guid is None:
            raise ValidationError("Invalid GUID")

        return guid

    def save(self, *args, **kwargs):
        is_create = not self.pk
        prev_path = None

        if is_create:
            prev_path = self.path
            self.path = RawSQL(
                "%s || ARRAY[currval('contents_content_id_seq')::integer]", [self.path]
            )

        super().save(*args, **kwargs)

        if is_create:
            self.guid = self.make_guid(self.pk)

            super().save(update_fields=["guid"])

        if prev_path is not None:
            self.path = prev_path + [self.pk]


class MountQuerySet(models.QuerySet):
    def for_user(self, user):
        queryset = self
        return queryset.filter(user=user)


class Mount(models.Model):
    class Perm(enum.IntFlag, models.Choices):
        NONE = 0
        OWN = 1
        USE = 2
        INSPECT = 4
        MODIFY = 8
        REMOVE = 16
        ALL = OWN | USE | INSPECT | MODIFY | REMOVE

    content: Content = models.ForeignKey(Content, on_delete=models.CASCADE)
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="mounts",
        blank=True,
        null=True,
    )
    perm: int = models.BigIntegerField(default=Perm.NONE, choices=Perm.choices)

    objects = models.Manager.from_queryset(MountQuerySet)()

    @classmethod
    def make_guid(cls, pk):
        return guids.encode(guids.MOUNT, pk)

    @property
    def guid(self):
        return self.make_guid(self.pk)


class Post(models.Model):
    description: str = models.TextField()

    @classmethod
    def make_guid(cls, pk):
        return guids.encode(guids.POST, pk)

    @property
    def guid(self):
        return self.make_guid(self.pk)
