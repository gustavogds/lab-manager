import jwt

from settings import JWT_ALGORITHM, JWT_SECRET


class AuthJWT:
    JWT_SECRET = JWT_SECRET

    @classmethod
    def encode(cls, payload):
        return jwt.encode(payload, cls.JWT_SECRET, algorithm=JWT_ALGORITHM)

    @classmethod
    def decode(cls, token):
        return jwt.decode(token, cls.JWT_SECRET, algorithms=[JWT_ALGORITHM])
