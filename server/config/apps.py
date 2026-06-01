from django.contrib.admin.apps import AdminConfig


class LabManagerAdminConfig(AdminConfig):
    default_site = "config.admin.SuperuserAdminSite"
