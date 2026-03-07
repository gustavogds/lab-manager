import datetime

from django.db import models
from django.utils import timezone


class ResearchArea(models.Model):
    title: str = models.CharField(max_length=255)
    description: str = models.TextField()
    is_active: bool = models.BooleanField(default=True)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title

    def __repr__(self):
        return f"<ResearchArea pk={self.pk} title={self.title}>"

    def export(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_active": self.is_active,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Project(models.Model):
    title: str = models.CharField(max_length=255)
    description: str = models.TextField()
    members = models.ManyToManyField("accounts.User", related_name="projects", blank=True)
    members_order = models.JSONField(default=list, blank=True)
    is_active: bool = models.BooleanField(default=True)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title

    def __repr__(self):
        return f"<Project pk={self.pk} title={self.title}>"

    def export(self):
        members_list = list(self.members.filter(is_public=True))
        members_map = {member.id: member for member in members_list}
        ordered_members = []
        for member_id in self.members_order or []:
            member = members_map.pop(member_id, None)
            if member:
                ordered_members.append(member)
        if members_map:
            ordered_members.extend([member for member in members_list if member.id in members_map])

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_active": self.is_active,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "members": [
                {
                    "id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "profile_image": member.profile_image.url if member.profile_image else None,
                }
                for member in ordered_members
            ],
        }


class Partnership(models.Model):
    name: str = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="partnership_logos/")
    link: str = models.URLField(max_length=500, blank=True, null=True)
    is_active: bool = models.BooleanField(default=True)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<Partnership pk={self.pk} name={self.name}>"

    def export(self):
        return {
            "id": self.id,
            "name": self.name,
            "logo": self.logo.url if self.logo else None,
            "link": self.link,
            "is_active": self.is_active,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Room(models.Model):
    name: str = models.CharField(max_length=255)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<Room pk={self.pk} name={self.name}>"

    def export(self):
        return {
            "id": self.id,
            "name": self.name,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class RoomSection(models.Model):
    name: str = models.CharField(max_length=255)
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="sections",
    )
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.room.name})"

    def __repr__(self):
        return f"<RoomSection pk={self.pk} name={self.name} room={self.room_id}>"

    def export(self):
        return {
            "id": self.id,
            "name": self.name,
            "room_id": self.room_id,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class IdentificationCategory(models.Model):
    name: str = models.CharField(max_length=255)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Identification Categories"

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<IdentificationCategory pk={self.pk} name={self.name}>"

    def export(self):
        return {
            "id": self.id,
            "name": self.name,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class EquipmentState(models.Model):
    name: str = models.CharField(max_length=255)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Equipment States"

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"<EquipmentState pk={self.pk} name={self.name}>"

    def export(self):
        return {
            "id": self.id,
            "name": self.name,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Equipment(models.Model):
    name: str = models.CharField(max_length=255)
    custom_id: str = models.CharField(max_length=100, unique=True)
    observation: str = models.TextField(blank=True, default="")
    identification_category = models.ForeignKey(
        IdentificationCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="equipment",
    )
    equipment_state = models.ForeignKey(
        EquipmentState,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="equipment",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="room_equipment",
    )
    section = models.ForeignKey(
        RoomSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="equipment",
    )
    assigned_to = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_equipment",
    )
    users = models.ManyToManyField(
        "accounts.User",
        blank=True,
        related_name="used_equipment",
    )
    users_order = models.JSONField(default=list, blank=True)
    is_active: bool = models.BooleanField(default=True)
    order: int = models.IntegerField(default=0)
    created_at: datetime.datetime = models.DateTimeField(default=timezone.now)
    updated_at: datetime.datetime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.custom_id})"

    def __repr__(self):
        return f"<Equipment pk={self.pk} custom_id={self.custom_id}>"

    def export(self):
        users_list = list(self.users.all())
        users_map = {u.id: u for u in users_list}
        ordered_users = []
        for uid in self.users_order or []:
            user = users_map.pop(uid, None)
            if user:
                ordered_users.append(user)
        if users_map:
            ordered_users.extend([u for u in users_list if u.id in users_map])

        return {
            "id": self.id,
            "name": self.name,
            "custom_id": self.custom_id,
            "observation": self.observation,
            "identification_category": self.identification_category.export() if self.identification_category else None,
            "equipment_state": self.equipment_state.export() if self.equipment_state else None,
            "room": self.room.export() if self.room else None,
            "section": self.section.export() if self.section else None,
            "assigned_to": {
                "id": self.assigned_to.id,
                "name": self.assigned_to.name,
                "email": self.assigned_to.email,
                "profile_image": self.assigned_to.profile_image.url if self.assigned_to.profile_image else None,
            } if self.assigned_to else None,
            "users": [
                {
                    "id": u.id,
                    "name": u.name,
                    "email": u.email,
                    "profile_image": u.profile_image.url if u.profile_image else None,
                }
                for u in ordered_users
            ],
            "is_active": self.is_active,
            "order": self.order,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
