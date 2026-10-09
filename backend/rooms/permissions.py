from rest_framework import permissions

class IsHostUser(permissions.BasePermission):
    """
    Allows access only to authenticated users who are Hosts.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'user_type', None) == 'host'
        )


class IsRoomHost(permissions.BasePermission):
    """
    Custom permission to only allow hosts of a room to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user and 
            request.user.is_authenticated and 
            obj.host == request.user
        )
