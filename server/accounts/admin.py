from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from accounts.models import User


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        exclude = []


class CustomUserAdmin(UserAdmin):
    form = UserChangeForm
    model = User
    list_display = (
        "email",
        "username",
        "is_active",
        "is_staff",
    )
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("username",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Important dates", {"fields": ("date_joined",)}),
    )
    readonly_fields = ("date_joined",)
    search_fields = ("email", "username")
    ordering = ("email",)

    def has_add_permission(self, request):
        return False


admin.site.register(User, CustomUserAdmin)
