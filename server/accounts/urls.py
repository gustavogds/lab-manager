from django.urls import path
from accounts import views


urlpatterns = [
    path("settings/", views.update_user_settings, name="update_user_settings"),
    path("approve/", views.approve_user, name="approve_user"),
    path("reject/", views.reject_user, name="reject_user"),
    path("list-unapproved/", views.list_unapproved_users, name="list_unapproved_users"),
]
