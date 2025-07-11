import ujson as json

from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie

from accounts.models import User
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

    user = authenticate(email=email, password=password)
    if user is None:
        raise ValidationError("Invalid credentials")

    if not user.is_approved:
        raise ValidationError("This account is not active yet.")

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


@methods_allowed(["GET"])
def whoami(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            content={"success": True, "error": "Authentication required"},
        )
    return JsonResponse(content={"success": True, "data": request.user.export()})


@methods_allowed(["POST"])
def sign_up(request):
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    role = data.get("role")

    if password != data.get("confirmPassword"):
        raise ValidationError("Passwords do not match")

    if not email:
        raise ValidationError("Users must have an email address")

    if not username:
        raise ValidationError("Users must have a name")

    if not password:
        raise ValidationError("Users must have a password")

    if not role:
        raise ValidationError("Role is required")

    if User.objects.filter(email=email).exists():
        raise ValidationError("User with this email already exists")

    User.objects.create_user(
        name=name, email=email, password=password, username=username, role=role
    )

    return JsonResponse(
        content={
            "success": True,
        }
    )


@ensure_csrf_cookie
def session(request):
    if not request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": False})
    return JsonResponse({"isAuthenticated": True})
