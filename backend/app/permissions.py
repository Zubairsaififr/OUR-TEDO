from rest_framework.permissions import BasePermission
from rest_framework import permissions


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsSubscribed(permissions.BasePermission):
    """
    Custom permission: allow only users who are approved + have active subscription.
    """

    message = "You are not approved or your subscription is not active. Please contact admin or renew your plan."

    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated
            and user.is_approved         # ✅ check admin approval
            and user.has_active_subscription  # ✅ check active subscription
        )
