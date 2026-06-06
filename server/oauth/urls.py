from django.urls import path
from oauth import views


urlpatterns = [
    path("sign-in/", views.sign_in, name="sign-in"),
    path("sign-up/", views.sign_up, name="sign-up"),
    path("sign-out/", views.sign_out, name="sign-out"),
    path("verify-email/", views.verify_email, name="verify-email"),
    path("password-reset/", views.request_password_reset, name="password-reset"),
    path(
        "password-reset/confirm/",
        views.confirm_password_reset,
        name="password-reset-confirm",
    ),
    path("sync/", views.sync, name="sync"),
    path("session/", views.session, name="session"),
    path("whoami/", views.whoami, name="whoami"),
]
