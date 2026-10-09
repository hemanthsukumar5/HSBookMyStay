from datetime import timedelta
from django.utils import timezone
from django.db import models
from rest_framework import permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from rooms.models import Room
from rooms.permissions import IsHostUser
from rooms.serializers import RoomSerializer
from orders.models import OrderItem, Order
from .serializers import HostOrderItemSerializer, UpdateOrderItemStatusSerializer

class HostOrderItemsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsHostUser]
    serializer_class = HostOrderItemSerializer

    def get_queryset(self):
        return OrderItem.objects.filter(host=self.request.user).select_related('order', 'room').order_by('-created_at')


class HostOrderItemStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHostUser]

    def patch(self, request, pk):
        try:
            order_item = OrderItem.objects.select_related('order', 'host').get(pk=pk)
        except OrderItem.DoesNotExist:
            raise NotFound("Order item not found.")

        if order_item.host != request.user:
            raise PermissionDenied("You do not have permission to update this order item.")

        serializer = UpdateOrderItemStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        order_item.status = new_status
        order_item.save()

        # Recalculate parent order aggregate status & payment status
        order_item.order.update_aggregate_status()

        return Response(HostOrderItemSerializer(order_item).data, status=status.HTTP_200_OK)


class HostDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHostUser]

    def get(self, request):
        host = request.user
        host_rooms = Room.objects.filter(host=host)
        host_items = OrderItem.objects.filter(host=host)

        # 1. Summary statistics
        total_revenue = host_items.exclude(status='cancelled').aggregate(
            total=models.Sum('subtotal')
        )['total'] or 0.00

        total_bookings = host_items.exclude(status='cancelled').count()
        active_rooms = host_rooms.filter(availability=True).count()
        pending_confirmations = host_items.filter(status='placed').count()

        # 2. Still-to-confirm bookings
        pending_items = host_items.filter(status='placed').select_related('order', 'room').order_by('-created_at')[:10]
        pending_serialized = HostOrderItemSerializer(pending_items, many=True).data

        # 3. 7-day sales chart
        today = timezone.now().date()
        seven_days_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_items = host_items.filter(
                created_at__date=day
            ).exclude(status='cancelled')
            
            revenue = day_items.aggregate(total=models.Sum('subtotal'))['total'] or 0.00
            bookings = day_items.count()
            
            seven_days_data.append({
                'date': day.strftime('%Y-%m-%d'),
                'day': day.strftime('%a'),
                'revenue': float(revenue),
                'bookings': bookings
            })

        # 4. Top performing rooms
        top_rooms_query = host_items.exclude(status='cancelled').values(
            'room__id', 'room_title', 'hotel'
        ).annotate(
            total_revenue=models.Sum('subtotal'),
            bookings_count=models.Count('id')
        ).order_by('-total_revenue')[:5]

        top_performing_rooms = [
            {
                'room_id': item['room__id'],
                'room_title': item['room_title'],
                'hotel': item['hotel'],
                'total_revenue': float(item['total_revenue'] or 0),
                'bookings_count': item['bookings_count']
            }
            for item in top_rooms_query
        ]

        # 5. Items by status
        items_by_status = {
            'placed': host_items.filter(status='placed').count(),
            'shipped': host_items.filter(status='shipped').count(),
            'delivered': host_items.filter(status='delivered').count(),
            'cancelled': host_items.filter(status='cancelled').count(),
        }

        return Response({
            'summary': {
                'total_revenue': float(total_revenue),
                'total_bookings': total_bookings,
                'active_rooms': active_rooms,
                'pending_confirmations': pending_confirmations,
            },
            'still_to_confirm': pending_serialized,
            'seven_day_sales': seven_days_data,
            'top_performing_rooms': top_performing_rooms,
            'items_by_status': items_by_status,
        })
