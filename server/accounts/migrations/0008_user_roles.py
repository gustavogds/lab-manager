# Generated migration for converting role to roles

from django.db import migrations, models


def migrate_role_to_roles(apps, schema_editor):
    """Convert single role to roles list"""
    User = apps.get_model('accounts', 'User')
    for user in User.objects.all():
        if hasattr(user, 'role') and user.role:
            user.roles = [user.role]
        else:
            user.roles = ['student']
        user.save()


def migrate_roles_to_role(apps, schema_editor):
    """Convert roles list back to single role (reverse migration)"""
    User = apps.get_model('accounts', 'User')
    for user in User.objects.all():
        if user.roles:
            # Take the first role or default to student
            user.role = user.roles[0] if user.roles[0] in ['professor', 'student', 'collaborator'] else 'student'
        else:
            user.role = 'student'
        user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_remove_user_storage_root'),
    ]

    operations = [
        # Add new roles field
        migrations.AddField(
            model_name='user',
            name='roles',
            field=models.JSONField(blank=True, default=list),
        ),
        # Migrate data from role to roles
        migrations.RunPython(migrate_role_to_roles, migrate_roles_to_role),
        # Remove old role field
        migrations.RemoveField(
            model_name='user',
            name='role',
        ),
    ]
