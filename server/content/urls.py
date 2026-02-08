from django.urls import path
from content import views
from content import reports


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
    path("partnerships/", views.list_partnerships, name="list_partnerships"),
    path("partnerships/all/", views.list_all_partnerships, name="list_all_partnerships"),
    path("partnerships/create/", views.create_partnership, name="create_partnership"),
    path("partnerships/config/", views.update_partnerships_config, name="update_partnerships_config"),
    path("partnerships/<int:partnership_id>/update/", views.update_partnership, name="update_partnership"),
    path("partnerships/<int:partnership_id>/delete/", views.delete_partnership, name="delete_partnership"),
    path("equipment/", views.list_equipment, name="list_equipment"),
    path("equipment/all/", views.list_all_equipment, name="list_all_equipment"),
    path("equipment/create/", views.create_equipment, name="create_equipment"),
    path("equipment/config/", views.update_equipment_config, name="update_equipment_config"),
    path("equipment/<int:equipment_id>/update/", views.update_equipment, name="update_equipment"),
    path("equipment/<int:equipment_id>/delete/", views.delete_equipment, name="delete_equipment"),
    path("reports/generate/", reports.generate_report, name="generate_report"),
]