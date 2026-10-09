from rest_framework import serializers
from orders.models import OrderItem

class HostOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    guest_name = serializers.ReadOnlyField(source='order.full_name')
    guest_phone = serializers.ReadOnlyField(source='order.phone_number')
    payment_method = serializers.ReadOnlyField(source='order.payment_method')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order_id', 'room', 'room_title', 'hotel', 'city',
            'imageUrl', 'price', 'quantity', 'subtotal', 'status',
            'created_at', 'guest_name', 'guest_phone', 'payment_method'
        ]
        read_only_fields = ['id', 'order_id', 'room', 'room_title', 'hotel', 'city', 'imageUrl', 'price', 'quantity', 'subtotal', 'created_at', 'guest_name', 'guest_phone', 'payment_method']


class UpdateOrderItemStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderItem.STATUS_CHOICES)
