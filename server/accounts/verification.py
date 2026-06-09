import hashlib
import logging

from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from django.template.loader import render_to_string

from accounts.email_i18n import (
    INVITATION_EMAIL,
    PASSWORD_RESET_EMAIL,
    VERIFY_EMAIL,
    normalize_lang,
    role_names,
)
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


def send_verification_email(user, lang: str | None = None) -> None:
    token = generate_verification_token(user.email)
    verification_url = f"{settings.SITE_URL}/auth/verify-email/?token={token}"

    logger.info("=" * 60)
    logger.info("VERIFICATION LINK for %s:", user.email)
    logger.info(verification_url)
    logger.info("=" * 60)

    t = VERIFY_EMAIL[normalize_lang(lang)]

    html_message = render_to_string(
        "accounts/verify_email.html",
        {
            "t": t,
            "user_name": user.name,
            "verification_url": verification_url,
        },
    )

    plain_message = t["plain"].format(name=user.name, url=verification_url)

    send_mail(
        subject=t["subject"],
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(user, lang: str | None = None) -> None:
    token = generate_password_reset_token(user)
    reset_url = f"{settings.SITE_URL}/password/reset/confirm?token={token}"

    logger.info("=" * 60)
    logger.info("PASSWORD RESET LINK for %s:", user.email)
    logger.info(reset_url)
    logger.info("=" * 60)

    t = PASSWORD_RESET_EMAIL[normalize_lang(lang)]

    html_message = render_to_string(
        "accounts/password_reset_email.html",
        {
            "t": t,
            "user_name": user.name,
            "reset_url": reset_url,
        },
    )

    plain_message = t["plain"].format(name=user.name, url=reset_url)

    send_mail(
        subject=t["subject"],
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_invitation_email(invitation) -> None:
    lang = normalize_lang(invitation.language)
    t = INVITATION_EMAIL[lang]

    try:
        lab_settings = LabSettings.objects.first()
        lab_name = lab_settings.name if lab_settings else t["default_lab_name"]
    except Exception:
        lab_name = t["default_lab_name"]

    invitation_url = f"{settings.SITE_URL}/signup?invite={invitation.token}"

    logger.info("=" * 60)
    logger.info("INVITATION LINK for %s:", invitation.email)
    logger.info(invitation_url)
    logger.info("=" * 60)

    invited_by_name = (
        invitation.invited_by.name if invitation.invited_by else t["default_invited_by"]
    )

    roles_display = role_names(invitation.roles, lang)

    html_message = render_to_string(
        "accounts/invitation_email.html",
        {
            "t": t,
            "lab_name": lab_name,
            "invited_by_name": invited_by_name,
            "invitation_url": invitation_url,
            "roles_display": roles_display,
            "prefilled_name": invitation.name,
        },
    )

    plain_message = t["plain"].format(
        by=invited_by_name,
        lab=lab_name,
        roles=roles_display,
        url=invitation_url,
    )

    send_mail(
        subject=t["subject"].format(lab=lab_name),
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        html_message=html_message,
        fail_silently=False,
    )

