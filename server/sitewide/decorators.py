from functools import wraps

from django.core.exceptions import ValidationError
from django.views.decorators.http import require_http_methods
from django.http import HttpResponseNotAllowed


def user_access_required(function=None, *, methods=None):
    if methods is None:
        methods = ["GET"]

    def decorator(func):
        func = require_http_methods(methods)(func)

        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if request.user.is_anonymous:
                raise ValidationError("You must be logged in to access this resource")

            return func(request, *args, **kwargs)

        return wrapper

    if function is None:
        return decorator

    return decorator(function)


def methods_allowed(methods):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if request.method not in methods:
                return HttpResponseNotAllowed(methods)
            return func(request, *args, **kwargs)

        return wrapper

    return decorator
