from django.contrib import admin
from django.urls import re_path
from django.views.static import serve
from django.views.generic import TemplateView
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf.urls import include
from django.conf.urls.static import static

urlpatterns = [
    re_path(r"^admin/", admin.site.urls),
    re_path(r"^auth/", include("oauth.urls")),
    re_path(r"^accounts/", include("accounts.urls")),
    re_path(r"^core/", include("core.urls")),
    re_path(r"^static/(?P<path>.*)$", serve, {"document_root": settings.STATIC_ROOT}),
    re_path(
        r"^media/object/(?P<path>.*)$",
        serve,
        {"document_root": settings.CONTENT_ROOT},
        name="content-object",
    ),
    re_path(
        r"^media/thumb/(?P<path>.*)$",
        serve,
        {"document_root": settings.THUMB_ROOT},
        name="content-thumbnail",
    ),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(
            r"^src/(?P<path>.*)$",
            serve,
            {"document_root": settings.STATIC_ROOT_CLIENT},
        ),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(
        r"^(?!admin).*",
        ensure_csrf_cookie(TemplateView.as_view(template_name="base.html")),
    )
]
