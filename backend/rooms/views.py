from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed, NotAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Room
from .serializers import RoomSerializer
from .filters import RoomFilter
from .pagination import StandardResultsSetPagination
from .permissions import IsHostUser, IsRoomHost

class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RoomFilter
    search_fields = ['title', 'hotel']
    ordering_fields = ['price', 'rating', 'id']
    ordering = ['id']

    def list(self, request, *args, **kwargs):
        # Enforce authentication requirement for suite queries
        is_suite_param = request.query_params.get('is_suite')
        if is_suite_param in ['true', 'True', '1'] and not request.user.is_authenticated:
            raise NotAuthenticated("Authentication credentials were not provided.")
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsHostUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        if self.request.user.user_type != 'host':
            raise PermissionDenied("Only host users can create rooms.")
        serializer.save(host=self.request.user)


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsHostUser(), IsRoomHost()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Enforce authentication requirement for suite details
        if instance.is_suite and not request.user.is_authenticated:
            raise NotAuthenticated("Authentication credentials were not provided.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in permissions.SAFE_METHODS and obj.host != request.user:
            raise PermissionDenied("You do not have permission to modify or delete this room.")


class HostRoomListView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'hotel', 'city']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Room.objects.filter(host=self.request.user)
