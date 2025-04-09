import ujson as json

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from accounts.models import User
from oauth.models import AuthJWT
from utils import JsonResponse
from sitewide.decorators import methods_allowed, user_access_required


@methods_allowed(["POST"])
def sign_in(request):
    data = json.loads(request.body)

    email = data.get("email")
    password = data.get("password")

    if not email:
        raise ValidationError("Email is required")

    if not password:
        raise ValidationError("Password is required")

    user = User.objects.filter(email=email).first()
    if not user:
        raise ValidationError("User not found")

    if not user.check_password(password):
        raise ValidationError("Invalid password")

    jwt_token = AuthJWT.encode(
        {"user_id": user.id, "exp": timezone.now() + timezone.timedelta(days=1)}
    )

    return JsonResponse(cookies={"auth": jwt_token})


@methods_allowed(["POST"])
def sign_out(request):
    return JsonResponse(cookies={"auth": ""})


@user_access_required(methods=["GET"])
def sync(request):
    return JsonResponse(content={"data": request.user.export()})


@methods_allowed(["POST"])
@transaction.atomic
def sign_up(request):
    print("Cheguei aqui")
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
