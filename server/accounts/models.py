from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    VALID_ROLES = ["professor", "student", "collaborator", "inventory_manager"]
    
    def create_user(self, name, email, password, username, roles=None, **kwargs):
        if roles is None:
            roles = ["student"]
        
        if not email:
            raise ValidationError("Users must have an email address")
        email = email.lower()

        if not username:
            raise ValidationError("Users must have a username")

        if not name:
            raise ValidationError("Users must have a name")

        if not password:
            raise ValidationError("Users must have a password")

        if not roles:
            raise ValidationError("Users must have at least one role")
        
        for role in roles:
            if role not in self.VALID_ROLES:
                raise ValidationError(
                    f"Invalid role: {role}. Must be one of: {', '.join(self.VALID_ROLES)}"
                )

        if User.objects.filter(email=email).exists():
            raise ValidationError("User with this email already exists")

        if User.objects.filter(username=username).exists():
            raise ValidationError("User with this username already exists")

        user = self.model(
            username=username,
            email=email,
            name=name,
            roles=roles,
            is_approved=False,
        )

        if not password:
            raise ValidationError("Users must have a password")

        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user("admin", email, password, "admin", roles=["professor"], **extra_fields)
        user.email_validated = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user

    def get_by_natural_key(self, username):
        return self.get(email__iexact=username.strip())


class User(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = "email"

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True, null=True, blank=True)

    name = models.CharField(max_length=50, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    researcher_order = models.IntegerField(default=0)
    show_in_researchers = models.BooleanField(default=True)
    is_former_member = models.BooleanField(default=False)
    birthdate = models.DateField(null=True, blank=True, default=timezone.now)
    phone = models.CharField(max_length=50, null=True, blank=True)
    contact_email = models.CharField(max_length=50, null=True, blank=True)
    social_media = models.CharField(max_length=50, null=True, blank=True)
    lattes = models.CharField(max_length=50, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    profile_image = models.ImageField(
        upload_to="profile_images/", null=True, blank=True
    )

    email_validated = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    roles = models.JSONField(default=list, blank=True)

    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    def __str__(self):
        return self.email

    def __repr__(self):
        return f"<User pk={self.pk} username={self.username} email={self.email}>"
    
    def has_role(self, role):
        """Check if user has a specific role"""
        return role in (self.roles or [])
    
    def has_any_role(self, roles_list):
        """Check if user has any of the specified roles"""
        return any(role in (self.roles or []) for role in roles_list)
    
    def can_manage_equipment(self):
        """Check if user can manage equipment"""
        return self.has_any_role(["professor", "inventory_manager"])
    
    def can_manage_all(self):
        """Check if user can manage everything (professor only)"""
        return self.has_role("professor")

    def export(self, include=None):
        data = {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "position": self.position,
            "researcher_order": self.researcher_order,
            "show_in_researchers": self.show_in_researchers,
            "is_former_member": self.is_former_member,
            "email": self.email,
            "birthdate": self.birthdate.isoformat(),
            "is_staff": self.is_staff,
            "is_active": self.is_active,
            "date_joined": self.date_joined.isoformat(),
            "roles": self.roles or [],
            "is_public": self.is_public,
            "phone": self.phone,
            "contact_email": self.contact_email,
            "social_media": self.social_media,
            "lattes": self.lattes,
            "bio": self.bio,
            "email_validated": self.email_validated,
            "profile_image": self.profile_image.url if self.profile_image else None,
        }

        if include is None:
            return data

        for key in include:
            if not hasattr(self, key):
                continue

            data[key] = getattr(self, key).export()

        return data
