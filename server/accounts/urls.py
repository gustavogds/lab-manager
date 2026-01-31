from django.urls import path
from accounts import views


urlpatterns = [
    path("settings/", views.update_user_settings, name="update_user_settings"),
    path(
        "settings/upload-profile-image/",
        views.upload_profile_image,
        name="upload_profile_image",
    ),
    path("approve/", views.approve_user, name="approve_user"),
    path("reject/", views.reject_user, name="reject_user"),
    path("list-unapproved/", views.list_unapproved_users, name="list_unapproved_users"),
    path("list-approved/", views.list_approved_users, name="list_approved_users"),
]
