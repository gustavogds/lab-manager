from accounts.models import User
from oauth.models import AuthJWT


class UserAuthJWT:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        jwt_token = request.COOKIES.get("auth")

        try:
            if jwt_token:
                payload = AuthJWT.decode(jwt_token)
                user = User.objects.filter(id=payload.get("user_id")).first()

                if user:
                    request.user = user
        except:
            del request.COOKIES["auth"]

        return self.get_response(request)
