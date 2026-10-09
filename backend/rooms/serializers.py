from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    host_username = serializers.ReadOnlyField(source='host.username')

    class Meta:
        model = Room
        fields = [
            'id', 'title', 'hotel', 'city', 'max_guests', 'category',
            'price', 'imageUrl', 'rating', 'total_reviews', 'availability',
            'description', 'is_suite', 'host', 'host_username'
        ]
        read_only_fields = ['id', 'host', 'host_username']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value

    def validate_max_guests(self, value):
        if value <= 0:
            raise serializers.ValidationError("Maximum guests must be at least 1.")
        return value
