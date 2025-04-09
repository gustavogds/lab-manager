from django.urls import re_path
from oauth import views


urlpatterns = [
    re_path(r"^sign-in/", views.sign_in, name="sign-in"),
    re_path(r"^sign-up/", views.sign_up, name="sign-up"),
    re_path(r"^sign-out/", views.sign_out, name="sign-out"),
    re_path(r"^sync/", views.sync, name="sync"),
]
