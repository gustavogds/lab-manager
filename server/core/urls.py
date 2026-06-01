from django.urls import path
from core import views


urlpatterns = [
    path("settings/", views.update_lab_settings, name="update_lab_settings"),
    path("settings/get/", views.get_lab_settings, name="get_lab_settings"),
    path("settings/upload-logo/", views.upload_lab_logo, name="upload-logo"),
    path("settings/upload-favicon/", views.upload_lab_favicon, name="upload-favicon"),
    path("settings/upload-about-image/", views.upload_about_image, name="upload-about-image"),
    path("settings/delete-about-image/<int:image_id>/", views.delete_about_image, name="delete-about-image"),
    path("upload/", views.file_upload, name="file-upload"),
]
