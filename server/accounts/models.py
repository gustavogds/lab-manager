import secrets

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Position(models.Model):
    name = models.CharField(max_length=100)
    is_visible = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def export(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_visible": self.is_visible,
            "order": self.order,
        }


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
    position = models.ForeignKey(
        Position,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )
    positions = models.ManyToManyField(
        Position,
        blank=True,
        related_name="users_multi",
    )
    room = models.ForeignKey(
        "content.Room",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users"
    )
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
        return role in (self.roles or [])
    
    def has_any_role(self, roles_list):
        return any(role in (self.roles or []) for role in roles_list)
    
    def can_manage_equipment(self):
        return self.has_any_role(["professor", "inventory_manager"])
    
    def can_manage_all(self):
        return self.has_role("professor")

    def export(self, include=None):
        user_positions = list(self.positions.all())
        visible_positions = [position for position in user_positions if position.is_visible]
        primary_position = visible_positions[0] if visible_positions else None

        data = {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "position": primary_position.export() if primary_position else None,
            "positions": [position.export() for position in user_positions],
            "room": self.room.export() if self.room else None,
            "researcher_order": self.researcher_order,
            "show_in_researchers": self.show_in_researchers,
            "is_former_member": self.is_former_member,
            "email": self.email,
            "birthdate": self.birthdate.isoformat() if self.birthdate else None,
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


class Invitation(models.Model):
    """
    Model for user invitations.
    When a professor invites someone, an invitation is created with a unique token.
    The invited user can use this token to complete registration without email
    verification or admin approval.
    """
    email = models.EmailField()
    token = models.CharField(max_length=64, unique=True, editable=False)
    roles = models.JSONField(default=list)
    
    # Optional pre-filled fields
    name = models.CharField(max_length=100, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    lattes = models.CharField(max_length=200, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    
    # Position can be pre-assigned
    positions = models.ManyToManyField(Position, blank=True, related_name="invitations")
    
    # Tracking
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_invitations"
    )
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invitation_used"
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ["-created_at"]
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            # Default expiration: 7 days
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Invitation for {self.email}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired
    
    def mark_as_used(self, user):
        self.is_used = True
        self.used_at = timezone.now()
        self.used_by = user
        self.save()
    
    def export(self):
        return {
            "id": self.id,
            "email": self.email,
            "roles": self.roles,
            "name": self.name,
            "phone": self.phone,
            "lattes": self.lattes,
            "bio": self.bio,
            "positions": [p.export() for p in self.positions.all()],
            "invited_by": self.invited_by.name if self.invited_by else None,
            "is_used": self.is_used,
            "is_expired": self.is_expired,
            "is_valid": self.is_valid,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
        }
