from rest_framework import serializers
from .models import Cart, CartItem
from rooms.models import Room
from rooms.serializers import RoomSerializer

class CartItemSerializer(serializers.ModelSerializer):
    room_id = serializers.IntegerField(source='room.id', read_only=True)
    room_title = serializers.CharField(source='room.title', read_only=True)
    hotel = serializers.CharField(source='room.hotel', read_only=True)
    city = serializers.CharField(source='room.city', read_only=True)
    price = serializers.DecimalField(source='room.price', max_digits=10, decimal_places=2, read_only=True)
    imageUrl = serializers.CharField(source='room.imageUrl', read_only=True)
    availability = serializers.BooleanField(source='room.availability', read_only=True)
    is_suite = serializers.BooleanField(source='room.is_suite', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'room', 'room_id', 'room_title', 'hotel', 'city',
            'price', 'imageUrl', 'availability', 'is_suite', 'quantity', 'subtotal'
        ]
        read_only_fields = ['id', 'room']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_nights = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_nights', 'total_price']


class AddToCartSerializer(serializers.Serializer):
    room_id = serializers.IntegerField(required=False)
    room = serializers.IntegerField(required=False)
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate(self, attrs):
        room_id = attrs.get('room_id') or attrs.get('room')
        if not room_id:
            raise serializers.ValidationError("room_id or room field is required.")
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            raise serializers.ValidationError("Room does not exist.")

        if not room.availability:
            raise serializers.ValidationError("This room is currently unavailable.")

        attrs['room_obj'] = room
        return attrs
