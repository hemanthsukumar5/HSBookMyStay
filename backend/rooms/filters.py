import django_filters
from .models import Room

class RoomFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category', lookup_expr='exact')
    hotel = django_filters.CharFilter(field_name='hotel', lookup_expr='icontains')
    rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    is_suite = django_filters.BooleanFilter(field_name='is_suite')

    class Meta:
        model = Room
        fields = ['category', 'hotel', 'rating', 'is_suite']
