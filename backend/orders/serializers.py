from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    host_username = serializers.ReadOnlyField(source='host.username')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'room', 'host', 'host_username', 'room_title', 'hotel',
            'city', 'imageUrl', 'price', 'quantity', 'subtotal', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'host', 'host_username', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_username', 'full_name', 'phone_number',
            'street_address', 'city', 'state', 'pincode', 'payment_method',
            'meal_plan', 'total_price', 'status', 'is_paid', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'user', 'user_username', 'total_price', 'status', 'is_paid', 'created_at', 'updated_at']


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=50)
    street_address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES, default='COD')
    meal_plan = serializers.ChoiceField(choices=Order.MEAL_PLAN_CHOICES, default='Room Only')
