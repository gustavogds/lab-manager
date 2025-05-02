import ujson as json

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from accounts.models import User
from oauth.models import AuthJWT
from utils import JsonResponse
from sitewide.decorators import methods_allowed, user_access_required
from django.contrib.auth import authenticate, login, logout


@methods_allowed(["POST"])
def sign_in(request):
    data = json.loads(request.body)

    email = data.get("email")
    password = data.get("password")

    if not email:
        raise ValidationError("Email is required")

    if not password:
        raise ValidationError("Password is required")

    user = authenticate(email=email, password=password)
    if user is None:
        raise ValidationError("Invalid credentials")

    login(request, user)

    return JsonResponse(content={"success": True})


@user_access_required(methods=["POST"])
def sign_out(request):
    if not request.user.is_authenticated:
        raise ValidationError("User is not authenticated")
    logout(request)
    return JsonResponse(content={"success": True})


@user_access_required(methods=["GET"])
def sync(request):
    return JsonResponse(content={"data": request.user.export()})


@methods_allowed(["POST"])
@transaction.atomic
def sign_up(request):
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    print(password)
    print(data.get("confirmPassword"))
    if password != data.get("confirmPassword"):
        print("a")
        raise ValidationError("Passwords do not match")

    user = User.objects.create_user(name, email, password, username)

    jwt_token = AuthJWT.encode(
        {"user_id": user.id, "exp": timezone.now() + timezone.timedelta(days=1)}
    )

    return JsonResponse(
        cookies={"auth": jwt_token},
    )
