from django.urls import path
from content import views


urlpatterns = [
    path("research-areas/", views.list_research_areas, name="list_research_areas"),
    path("research-areas/create/", views.create_research_area, name="create_research_area"),
    path("research-areas/<int:area_id>/", views.get_research_area, name="get_research_area"),
    path("research-areas/<int:area_id>/update/", views.update_research_area, name="update_research_area"),
    path("research-areas/<int:area_id>/delete/", views.delete_research_area, name="delete_research_area"),
    path("projects/", views.list_projects, name="list_projects"),
    path("projects/create/", views.create_project, name="create_project"),
    path("projects/<int:project_id>/", views.get_project, name="get_project"),
    path("projects/<int:project_id>/update/", views.update_project, name="update_project"),
    path("projects/<int:project_id>/delete/", views.delete_project, name="delete_project"),
]