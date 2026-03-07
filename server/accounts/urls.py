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
    path("researchers/", views.list_researchers, name="list_researchers"),
    path("researchers/all/", views.list_all_researchers, name="list_all_researchers"),
    path("researchers/config/", views.update_researchers_config, name="update_researchers_config"),
    path("positions/", views.list_positions, name="list_positions"),
    path("positions/create/", views.create_position, name="create_position"),
    path("positions/<int:position_id>/update/", views.update_position, name="update_position"),
    path("positions/<int:position_id>/delete/", views.delete_position, name="delete_position"),
    path("users/", views.list_all_users, name="list_all_users"),
    path("users/<int:user_id>/update/", views.update_user, name="update_user"),
    path("users/<int:user_id>/delete/", views.delete_user, name="delete_user"),
    # Invitation endpoints
    path("invitations/", views.list_invitations, name="list_invitations"),
    path("invitations/create/", views.create_invitation, name="create_invitation"),
    path("invitations/<str:token>/validate/", views.validate_invitation, name="validate_invitation"),
    path("invitations/<int:invitation_id>/delete/", views.delete_invitation, name="delete_invitation"),
    path("invitations/<int:invitation_id>/resend/", views.resend_invitation, name="resend_invitation"),
]
