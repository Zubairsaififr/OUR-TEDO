# app/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import User, Subscription

@receiver(post_save, sender=User)
def activate_subscription_on_approval(sender, instance, created, **kwargs):
    # only run when user already exists (not new creation)
    if not created:
        if instance.is_approved and not instance.has_active_subscription:
            Subscription.objects.create(
                user=instance,
                plan="free",  # default free plan
                status="active",
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=30)
            )
            # optional: flag bhi update kar de
            instance.is_subscribed = True
            instance.save(update_fields=["is_subscribed"])
