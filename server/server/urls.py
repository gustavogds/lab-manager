from django.contrib import admin
from django.urls import path
from .views import teste

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/teste/", teste),
]
