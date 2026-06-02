from django.contrib.admin import AdminSite
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse

# Route of the application's standard login page (served by the SPA).
APP_LOGIN_URL = "/signin"
# Route users are sent to when they are not allowed in the admin.
APP_HOME_URL = "/"


class SuperuserAdminSite(AdminSite):
    """Admin site restricted to authenticated superusers.

    Unauthenticated visitors are redirected to the application's standard
    login page instead of the built-in Django admin login form. Once they
    log in there, access to the admin is granted only if their account is a
    superuser; otherwise they are redirected to the home page.
    """

    def has_permission(self, request):
        user = request.user
        return bool(
            user.is_active and user.is_authenticated and user.is_superuser
        )

    def login(self, request, extra_context=None):
        # Allowed users that land on the login URL go straight to the admin.
        if self.has_permission(request):
            return HttpResponseRedirect(
                reverse("admin:index", current_app=self.name)
            )

        # Authenticated users without superuser access are sent home.
        if request.user.is_authenticated:
            return redirect(APP_HOME_URL)

        # Anonymous visitors are sent to the standard login screen.
        return redirect(APP_LOGIN_URL)
