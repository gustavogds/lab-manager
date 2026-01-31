import jwt

from django.conf import settings


class AuthJWT:
    JWT_SECRET = settings.JWT_SECRET

    @classmethod
    def encode(cls, payload):
        return jwt.encode(payload, cls.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    @classmethod
    def decode(cls, token):
        return jwt.decode(token, cls.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])