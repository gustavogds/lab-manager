from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


def migrate_position_to_fk(apps, schema_editor):
    Position = apps.get_model('accounts', 'Position')
    User = apps.get_model('accounts', 'User')
    
    position_map = {}
    for user in User.objects.exclude(position_old__isnull=True).exclude(position_old=''):
        position_name = user.position_old.strip()
        if position_name not in position_map:
            position, _ = Position.objects.get_or_create(name=position_name)
            position_map[position_name] = position
        user.position = position_map[position_name]
        user.save()


def migrate_position_to_char(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    for user in User.objects.filter(position__isnull=False):
        user.position_old = user.position.name
        user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_user_roles'),
        ('content', '0012_equipment_state'),
    ]

    operations = [
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
        migrations.RenameField(
            model_name='user',
            old_name='position',
            new_name='position_old',
        ),
        migrations.AddField(
            model_name='user',
            name='position',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='accounts.position'),
        ),
        migrations.RunPython(migrate_position_to_fk, migrate_position_to_char),
        migrations.RemoveField(
            model_name='user',
            name='position_old',
        ),
        migrations.AddField(
            model_name='user',
            name='room',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='content.room'),
        ),
    ]
