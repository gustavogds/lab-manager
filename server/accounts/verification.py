import hashlib
import logging

from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from django.template.loader import render_to_string

from core.models import LabSettings


logger = logging.getLogger(__name__)

VERIFICATION_SALT = "email-verification"
VERIFICATION_MAX_AGE = 60 * 60 * 24  # 24 hours

PASSWORD_RESET_SALT = "password-reset"
PASSWORD_RESET_MAX_AGE = 60 * 60  # 1 hour


def generate_verification_token(email: str) -> str:
    return signing.dumps({"email": email}, salt=VERIFICATION_SALT)


def verify_token(token: str) -> dict | None:
    try:
        return signing.loads(token, salt=VERIFICATION_SALT, max_age=VERIFICATION_MAX_AGE)
    except (signing.BadSignature, signing.SignatureExpired):
        return None


def _password_fingerprint(user) -> str:
    """Short digest of the current password hash so a reset token becomes
    invalid as soon as the password is changed (single use)."""
    return hashlib.sha256(user.password.encode()).hexdigest()[:16]


def generate_password_reset_token(user) -> str:
    return signing.dumps(
        {"email": user.email, "fp": _password_fingerprint(user)},
        salt=PASSWORD_RESET_SALT,
    )


def verify_password_reset_token(token: str) -> dict | None:
    try:
        return signing.loads(
            token, salt=PASSWORD_RESET_SALT, max_age=PASSWORD_RESET_MAX_AGE
        )
    except (signing.BadSignature, signing.SignatureExpired):
        return None


def send_verification_email(user) -> None:
    token = generate_verification_token(user.email)
    verification_url = f"{settings.SITE_URL}/auth/verify-email/?token={token}"

    logger.info("=" * 60)
    logger.info("VERIFICATION LINK for %s:", user.email)
    logger.info(verification_url)
    logger.info("=" * 60)

    html_message = render_to_string(
        "accounts/verify_email.html",
        {
            "user_name": user.name,
            "verification_url": verification_url,
        },
    )

    plain_message = (
        f"Olá, {user.name}!\n\n"
        f"Obrigado por criar sua conta. Para continuar o processo de cadastro, "
        f"confirme seu endereço de e-mail acessando o link abaixo:\n\n"
        f"{verification_url}\n\n"
        f"Este link expira em 24 horas. Caso não tenha criado esta conta, ignore este e-mail.\n"
    )

    send_mail(
        subject="Verifique seu e-mail",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(user) -> None:
    token = generate_password_reset_token(user)
    reset_url = f"{settings.SITE_URL}/password/reset/confirm?token={token}"

    logger.info("=" * 60)
    logger.info("PASSWORD RESET LINK for %s:", user.email)
    logger.info(reset_url)
    logger.info("=" * 60)

    html_message = render_to_string(
        "accounts/password_reset_email.html",
        {
            "user_name": user.name,
            "reset_url": reset_url,
        },
    )

    plain_message = (
        f"Olá, {user.name}!\n\n"
        f"Recebemos uma solicitação para redefinir a senha da sua conta. "
        f"Para escolher uma nova senha, acesse o link abaixo:\n\n"
        f"{reset_url}\n\n"
        f"Este link expira em 1 hora. Caso não tenha solicitado a redefinição, "
        f"ignore este e-mail — sua senha permanecerá a mesma.\n"
    )

    send_mail(
        subject="Redefinição de senha",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_invitation_email(invitation) -> None:
    try:
        lab_settings = LabSettings.objects.first()
        lab_name = lab_settings.name if lab_settings else "Laboratório"
    except Exception:
        lab_name = "Laboratório"
    
    invitation_url = f"{settings.SITE_URL}/signup?invite={invitation.token}"
    
    logger.info("=" * 60)
    logger.info("INVITATION LINK for %s:", invitation.email)
    logger.info(invitation_url)
    logger.info("=" * 60)
    
    invited_by_name = invitation.invited_by.name if invitation.invited_by else "Um administrador"
    
    role_names = {
        "professor": "Professor",
        "student": "Estudante",
        "collaborator": "Colaborador",
        "inventory_manager": "Gestor de Inventário",
    }
    roles_display = ", ".join(role_names.get(r, r) for r in invitation.roles)
    
    html_message = render_to_string(
        "accounts/invitation_email.html",
        {
            "lab_name": lab_name,
            "invited_by_name": invited_by_name,
            "invitation_url": invitation_url,
            "roles_display": roles_display,
            "prefilled_name": invitation.name,
        },
    )
    
    plain_message = (
        f"Olá!\n\n"
        f"Você foi convidado(a) por {invited_by_name} para fazer parte do {lab_name}.\n\n"
        f"Função(ões): {roles_display}\n\n"
        f"Para completar seu cadastro, acesse o link abaixo:\n\n"
        f"{invitation_url}\n\n"
        f"Este convite expira em 7 dias.\n"
    )
    
    send_mail(
        subject=f"Convite para participar do {lab_name}",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        html_message=html_message,
        fail_silently=False,
    )

