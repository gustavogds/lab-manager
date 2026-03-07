# Generated migration for RoomSection model and Equipment.section field

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0012_equipment_state'),
    ]

    operations = [
        migrations.CreateModel(
            name='RoomSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='content.room')),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
        migrations.AddField(
            model_name='equipment',
            name='section',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='equipment', to='content.roomsection'),
        ),
    ]
