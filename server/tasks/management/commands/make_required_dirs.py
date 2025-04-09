from tasks.jobs import make_required_dirs
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Make required directories for the application"

    def handle(self, *args, **options):
        make_required_dirs()
