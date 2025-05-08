from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone
from contents.models import Content, ContentKind, Mount


class UserManager(BaseUserManager):
    def create_user(self, name, email, password, username, **kwargs):
        if not email:
            raise ValidationError("Users must have an email address")
        email = email.lower()

        if not username:
            raise ValidationError("Users must have a username")

        if not name:
            raise ValidationError("Users must have a name")

        if not password:
            raise ValidationError("Users must have a password")

        if User.objects.filter(email=email).exists():
            raise ValidationError("User with this email already exists")

        if User.objects.filter(username=username).exists():
            raise ValidationError("User with this username already exists")

        root_folder = Content.objects.create(
            path=[],
            kind=ContentKind.FOLDER,
            name=email,
            meta={"root": True},
        )

        user = self.model(
            username=username,
            email=email,
            name=name,
            storage_root=root_folder,
        )

        if not password:
            raise ValidationError("Users must have a password")

        user.set_password(password)
        user.save()

        Mount.objects.create(user=user, content=root_folder, perm=Mount.Perm.ALL)

        return user

    @transaction.atomic
    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user("admin", email, password, "admin", **extra_fields)
        user.email_validated = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user

    def get_by_natural_key(self, username):
        return self.get(email__iexact=username.strip())


class User(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = "email"

    storage_root = models.ForeignKey(
        "contents.Content",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="storage_root",
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True, null=True, blank=True)

    name = models.CharField(max_length=50, null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True, default=timezone.now)
    phone = models.CharField(max_length=50, null=True, blank=True)
    contact_email = models.CharField(max_length=50, null=True, blank=True)
    social_media = models.CharField(max_length=50, null=True, blank=True)
    lattes = models.CharField(max_length=50, null=True, blank=True)
    is_public = models.BooleanField(default=True)

    email_validated = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    role = models.CharField(
        max_length=50,
        choices=[
            ("professor", "Professor"),
            ("student", "Student"),
            ("colaborator", "Collaborator"),
        ],
        default="colaborator",
    )

    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    def __str__(self):
        return self.email

    def __repr__(self):
        return f"<User pk={self.pk} username={self.username} email={self.email}>"

    def export(self, include=None):
        data = {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "email": self.email,
            "birthdate": self.birthdate.isoformat(),
            "is_staff": self.is_staff,
            "is_active": self.is_active,
            "date_joined": self.date_joined.isoformat(),
            "role": self.role,
            "is_public": self.is_public,
            "phone": self.phone,
            "contact_email": self.contact_email,
            "social_media": self.social_media,
            "lattes": self.lattes,
            "email_validated": self.email_validated,
        }

        if include is None:
            return data

        for key in include:
            if not hasattr(self, key):
                continue

            data[key] = getattr(self, key).export()

        return data
