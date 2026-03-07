import ujson as json

from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import redirect

from accounts.models import User
from accounts.verification import send_verification_email, verify_token
from config.utils import JsonResponse
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

    identifier = email.strip()
    if "@" in identifier:
        auth_email = identifier
    else:
        user_match = User.objects.filter(username__iexact=identifier).first()
        auth_email = user_match.email if user_match else identifier

    user = authenticate(email=auth_email, password=password)
    if user is None:
        raise ValidationError("Usuário ou senha inválidos")

    if not user.email_validated:
        raise ValidationError("Verifique seu e-mail antes de continuar.")

    if not user.is_approved:
        raise ValidationError("Sua conta ainda não foi aprovada por um administrador.")

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
    
    roles = data.get("roles")
    if not roles:
        role = data.get("role")
        roles = [role] if role else None

    if password != data.get("confirmPassword"):
        raise ValidationError("Passwords do not match")

    if not email:
        raise ValidationError("Users must have an email address")

    if not username:
        raise ValidationError("Users must have a name")

    if not password:
        raise ValidationError("Users must have a password")

    if not roles:
        raise ValidationError("Role is required")

    if User.objects.filter(email=email).exists():
        raise ValidationError("User with this email already exists")

    user = User.objects.create_user(
        name=name, email=email, password=password, username=username, roles=roles
    )

    send_verification_email(user)

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


@methods_allowed(["GET"])
def verify_email(request):
    token = request.GET.get("token")
    if not token:
        return redirect("/signin?verified=invalid")

    data = verify_token(token)
    if data is None:
        return redirect("/signin?verified=expired")

    email = data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return redirect("/signin?verified=invalid")

    if user.email_validated:
        return redirect("/signin?verified=already")

    user.email_validated = True
    user.save()

    return redirect("/signin?verified=success")
