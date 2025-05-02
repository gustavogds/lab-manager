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
    def create_user(self, full_name, email, password, username, **kwargs):
        if not email:
            raise ValidationError("Users must have an email address")
        email = email.lower()

        if not username:
            raise ValidationError("Users must have a username")

        if not full_name:
            raise ValidationError("Users must have a full name")

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
            full_name=full_name,
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
    full_name = models.CharField(max_length=50, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True, default=timezone.now)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

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
            "full_name": self.full_name,
            "email": self.email,
            "date_of_birth": self.date_of_birth.isoformat(),
            "is_staff": self.is_staff,
            "is_active": self.is_active,
            "date_joined": self.date_joined.isoformat(),
        }

        if include is None:
            return data

        for key in include:
            if not hasattr(self, key):
                continue

            data[key] = getattr(self, key).export()

        return data
