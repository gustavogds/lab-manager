SUPPORTED_LANGS = ("pt", "en")
DEFAULT_LANG = "pt"


def normalize_lang(lang: str | None) -> str:
    lang = (lang or "").lower()
    return "pt" if lang.startswith("pt") else "en" if lang.startswith("en") else DEFAULT_LANG


# Human-readable role names, used to build the invitation's "assigned roles"
# line. Keys mirror ``UserManager.VALID_ROLES``.
ROLE_NAMES = {
    "pt": {
        "professor": "Professor",
        "student": "Estudante",
        "collaborator": "Colaborador",
        "inventory_manager": "Gestor de Inventário",
    },
    "en": {
        "professor": "Professor",
        "student": "Student",
        "collaborator": "Collaborator",
        "inventory_manager": "Inventory Manager",
    },
}


def role_names(roles, lang: str) -> str:
    names = ROLE_NAMES[lang]
    return ", ".join(names.get(role, role) for role in roles)


VERIFY_EMAIL = {
    "pt": {
        "html_lang": "pt-BR",
        "subject": "Verifique seu e-mail",
        "title": "Verificação de E-mail",
        "greeting": "Olá",
        "intro": (
            "Obrigado por criar sua conta. Para continuar o processo de "
            "cadastro, confirme seu endereço de e-mail clicando no botão abaixo:"
        ),
        "button": "Verificar E-mail",
        "fallback": (
            "Se o botão não funcionar, copie e cole o link abaixo no seu navegador:"
        ),
        "expiry": (
            "Este link expira em 24 horas. Caso não tenha criado esta conta, "
            "ignore este e-mail."
        ),
        "footer": "Este é um e-mail automático. Por favor, não responda.",
        "plain": (
            "Olá, {name}!\n\n"
            "Obrigado por criar sua conta. Para continuar o processo de cadastro, "
            "confirme seu endereço de e-mail acessando o link abaixo:\n\n"
            "{url}\n\n"
            "Este link expira em 24 horas. Caso não tenha criado esta conta, "
            "ignore este e-mail.\n"
        ),
    },
    "en": {
        "html_lang": "en",
        "subject": "Verify your email",
        "title": "Email Verification",
        "greeting": "Hello",
        "intro": (
            "Thank you for creating your account. To continue the registration "
            "process, please confirm your email address by clicking the button below:"
        ),
        "button": "Verify Email",
        "fallback": (
            "If the button doesn't work, copy and paste the link below into your browser:"
        ),
        "expiry": (
            "This link expires in 24 hours. If you did not create this account, "
            "please ignore this email."
        ),
        "footer": "This is an automated email. Please do not reply.",
        "plain": (
            "Hello, {name}!\n\n"
            "Thank you for creating your account. To continue the registration "
            "process, confirm your email address by visiting the link below:\n\n"
            "{url}\n\n"
            "This link expires in 24 hours. If you did not create this account, "
            "please ignore this email.\n"
        ),
    },
}


PASSWORD_RESET_EMAIL = {
    "pt": {
        "html_lang": "pt-BR",
        "subject": "Redefinição de senha",
        "title": "Redefinição de Senha",
        "greeting": "Olá",
        "intro": (
            "Recebemos uma solicitação para redefinir a senha da sua conta. "
            "Para escolher uma nova senha, clique no botão abaixo:"
        ),
        "button": "Redefinir Senha",
        "fallback": (
            "Se o botão não funcionar, copie e cole o link abaixo no seu navegador:"
        ),
        "expiry": (
            "Este link expira em 1 hora. Caso não tenha solicitado a redefinição, "
            "ignore este e-mail — sua senha permanecerá a mesma."
        ),
        "footer": "Este é um e-mail automático. Por favor, não responda.",
        "plain": (
            "Olá, {name}!\n\n"
            "Recebemos uma solicitação para redefinir a senha da sua conta. "
            "Para escolher uma nova senha, acesse o link abaixo:\n\n"
            "{url}\n\n"
            "Este link expira em 1 hora. Caso não tenha solicitado a redefinição, "
            "ignore este e-mail — sua senha permanecerá a mesma.\n"
        ),
    },
    "en": {
        "html_lang": "en",
        "subject": "Password reset",
        "title": "Password Reset",
        "greeting": "Hello",
        "intro": (
            "We received a request to reset your account password. To choose a "
            "new password, click the button below:"
        ),
        "button": "Reset Password",
        "fallback": (
            "If the button doesn't work, copy and paste the link below into your browser:"
        ),
        "expiry": (
            "This link expires in 1 hour. If you did not request a reset, please "
            "ignore this email — your password will remain unchanged."
        ),
        "footer": "This is an automated email. Please do not reply.",
        "plain": (
            "Hello, {name}!\n\n"
            "We received a request to reset your account password. To choose a "
            "new password, visit the link below:\n\n"
            "{url}\n\n"
            "This link expires in 1 hour. If you did not request a reset, please "
            "ignore this email — your password will remain unchanged.\n"
        ),
    },
}


INVITATION_EMAIL = {
    "pt": {
        "html_lang": "pt-BR",
        # subject is a format string: {lab} is substituted at send time.
        "subject": "Convite para participar do {lab}",
        "header_title": "🎉 Você foi convidado(a)!",
        "greeting": "Olá",
        # "{by} <invited_to_join> {lab}." — connector between the two names.
        "invited_to_join": "convidou você para fazer parte do",
        "roles_label": "Função(ões) atribuída(s):",
        "cta": (
            "Para completar seu cadastro e começar a usar o sistema, clique no "
            "botão abaixo:"
        ),
        "button": "Completar Cadastro",
        "fallback": (
            "Se o botão não funcionar, copie e cole o link abaixo no seu navegador:"
        ),
        "expires_prefix": "⏰ Este convite expira em",
        "expires_days": "7 dias",
        "unexpected": (
            "Se você não esperava este convite, pode ignorar este e-mail com segurança."
        ),
        # "<footer_automatic> {lab}."
        "footer_automatic": "Este é um e-mail automático enviado pelo sistema do",
        "default_lab_name": "Laboratório",
        "default_invited_by": "Um administrador",
        "plain": (
            "Olá!\n\n"
            "Você foi convidado(a) por {by} para fazer parte do {lab}.\n\n"
            "Função(ões): {roles}\n\n"
            "Para completar seu cadastro, acesse o link abaixo:\n\n"
            "{url}\n\n"
            "Este convite expira em 7 dias.\n"
        ),
    },
    "en": {
        "html_lang": "en",
        "subject": "Invitation to join {lab}",
        "header_title": "🎉 You've been invited!",
        "greeting": "Hello",
        "invited_to_join": "has invited you to join",
        "roles_label": "Assigned role(s):",
        "cta": (
            "To complete your registration and start using the system, click the "
            "button below:"
        ),
        "button": "Complete Registration",
        "fallback": (
            "If the button doesn't work, copy and paste the link below into your browser:"
        ),
        "expires_prefix": "⏰ This invitation expires in",
        "expires_days": "7 days",
        "unexpected": (
            "If you weren't expecting this invitation, you can safely ignore this email."
        ),
        "footer_automatic": "This is an automated email sent by the system of",
        "default_lab_name": "Laboratory",
        "default_invited_by": "An administrator",
        "plain": (
            "Hello!\n\n"
            "You have been invited by {by} to join {lab}.\n\n"
            "Role(s): {roles}\n\n"
            "To complete your registration, access the link below:\n\n"
            "{url}\n\n"
            "This invitation expires in 7 days.\n"
        ),
    },
}
