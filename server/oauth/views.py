import ujson as json

from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import redirect

from accounts.models import User
from accounts.verification import (
    send_password_reset_email,
    send_verification_email,
    verify_password_reset_token,
    verify_token,
)
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
    invitation_token = data.get("invitation_token")
    
    # Check if this is an invitation-based signup
    invitation = None
    if invitation_token:
        from accounts.models import Invitation
        try:
            invitation = Invitation.objects.get(token=invitation_token)
            if not invitation.is_valid:
                raise ValidationError("This invitation is no longer valid.")
            # Use email from invitation
            email = invitation.email
        except Invitation.DoesNotExist:
            raise ValidationError("Invalid invitation.")
    
    roles = data.get("roles")
    if not roles:
        role = data.get("role")
        roles = [role] if role else None
    
    # If invitation exists, use roles from invitation
    if invitation:
        roles = invitation.roles

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
    
    # If invitation exists, mark user as approved and email validated
    if invitation:
        user.email_validated = True
        user.is_approved = True
        
        # Apply pre-filled fields from invitation
        if invitation.phone:
            user.phone = invitation.phone
        if invitation.lattes:
            user.lattes = invitation.lattes
        if invitation.bio:
            user.bio_pt = invitation.bio
        
        # Apply positions from invitation
        if invitation.positions.exists():
            positions = list(invitation.positions.all())
            user.positions.set(positions)
            user.position = positions[0] if positions else None
        
        user.save()
        
        # Mark invitation as used
        invitation.mark_as_used(user)
        
        return JsonResponse(
            content={
                "success": True,
                "message": "Account created successfully. You can now sign in.",
                "auto_approved": True,
            }
        )

    send_verification_email(user)

    return JsonResponse(
        content={
            "success": True,
        }
    )


@methods_allowed(["POST"])
def request_password_reset(request):
    data = json.loads(request.body)
    email = (data.get("email") or "").strip()

    if not email:
        raise ValidationError("Email is required")

    # Only send the email if the account exists, but always respond the same way
    # so the endpoint can't be used to probe which emails are registered.
    user = User.objects.filter(email__iexact=email).first()
    if user is not None:
        send_password_reset_email(user)

    return JsonResponse(content={"success": True})


@methods_allowed(["POST"])
def confirm_password_reset(request):
    data = json.loads(request.body)
    token = data.get("token")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not token:
        raise ValidationError("Token is required")

    if not password:
        raise ValidationError("Password is required")

    if password != confirm_password:
        raise ValidationError("Passwords do not match")

    payload = verify_password_reset_token(token)
    if payload is None:
        raise ValidationError("O link de redefinição é inválido ou expirou.")

    user = User.objects.filter(email=payload.get("email")).first()
    if user is None:
        raise ValidationError("O link de redefinição é inválido ou expirou.")

    # Re-validate the fingerprint so a token can only be used once: changing the
    # password rotates the hash and invalidates any previously issued token.
    from accounts.verification import _password_fingerprint

    if payload.get("fp") != _password_fingerprint(user):
        raise ValidationError("O link de redefinição é inválido ou expirou.")

    user.set_password(password)
    user.save()

    return JsonResponse(content={"success": True})


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
