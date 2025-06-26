from django.urls import path
from core import views


urlpatterns = [
    path("settings/", views.update_lab_settings, name="update_lab_settings"),
    path("settings/get/", views.get_lab_settings, name="get_lab_settings"),
    path("settings/upload-logo/", views.upload_lab_logo, name="upload-logo"),
    path("upload/", views.file_upload, name="file-upload"),
]
