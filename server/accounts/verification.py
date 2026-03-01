import logging

from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from django.template.loader import render_to_string


logger = logging.getLogger(__name__)

VERIFICATION_SALT = "email-verification"
VERIFICATION_MAX_AGE = 60 * 60 * 24  # 24 hours


def generate_verification_token(email: str) -> str:
    return signing.dumps({"email": email}, salt=VERIFICATION_SALT)


def verify_token(token: str) -> dict | None:
    try:
        return signing.loads(token, salt=VERIFICATION_SALT, max_age=VERIFICATION_MAX_AGE)
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
