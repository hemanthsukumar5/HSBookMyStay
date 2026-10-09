import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from rooms.models import Room
from orders.models import Order, OrderItem

User = get_user_model()

class Command(BaseCommand):
    help = "Seed initial rooms, demo accounts (Priya & Arjun), and optional sample orders."

    def add_arguments(self, parser):
        parser.add_argument(
            '--with-orders',
            action='store_true',
            help='Seed sample orders for testing the host dashboard.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting seed process..."))

        # 1. Create Demo Accounts
        host_user, host_created = User.objects.get_or_create(
            username='Priya',
            defaults={
                'email': 'priya@bookmystay.com',
                'user_type': 'host',
                'first_name': 'Priya',
                'last_name': 'Sharma',
            }
        )
        if host_created or not host_user.check_password('secret123'):
            host_user.set_password('secret123')
            host_user.user_type = 'host'
            host_user.save()
            self.stdout.write(self.style.SUCCESS("Host user 'Priya' created/updated."))

        guest_user, guest_created = User.objects.get_or_create(
            username='Arjun',
            defaults={
                'email': 'arjun@bookmystay.com',
                'user_type': 'guest',
                'first_name': 'Arjun',
                'last_name': 'Kapoor',
            }
        )
        if guest_created or not guest_user.check_password('secret123'):
            guest_user.set_password('secret123')
            guest_user.user_type = 'guest'
            guest_user.save()
            self.stdout.write(self.style.SUCCESS("Guest user 'Arjun' created/updated."))

        # Unsplash high quality hospitality photos
        images = [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        ]

        cities = ["Goa", "Mumbai", "Jaipur", "Udaipur", "Bengaluru", "Kerala", "Shimla", "Manali"]

        suite_ids = {9, 11, 18, 20, 42, 50}

        # Build list of 54 categories: 15 Hotels, 14 Resorts, 13 Homestays, 12 Villas
        categories_pool = (
            ['Hotels'] * 15 +
            ['Resorts'] * 14 +
            ['Homestays'] * 13 +
            ['Villas'] * 12
        )

        titles_by_cat = {
            'Hotels': ["Grand Palace Hotel", "Royal Heritage Inn", "City Center Luxury Hotel", "The Imperial Stay", "Horizon Tower Hotel", "Emerald Bay Hotel", "Starlight Boutique Hotel", "Metropolitan Grand Hotel", "Amber Court Hotel", "Regal Crown Hotel", "Majestic Plaza Hotel", "Sapphire View Hotel", "The Park Avenue Hotel", "Prestige Residency", "Golden Oasis Hotel"],
            'Resorts': ["Palms Beach Resort", "Mountain Mist Resort", "Lakeside Haven Resort", "Forest Echoes Eco Resort", "Sunset Cove Beach Resort", "Valley Breeze Wellness Resort", "Serenity Springs Resort", "Oceanic Bliss Resort", "Pine Crest Alpine Resort", "Infinity Pool Hill Resort", "Coral Reef Resort", "Wilderness Edge Resort", "Whistling Woods Resort", "Tranquil Bay Resort"],
            'Homestays': ["Cozy Cottage Homestay", "Heritage Haveli Homestay", "Orchard View Nest", "Green Valley Home", "Riverside Cottage Homestay", "Traditional Teak House", "Hilltop Haven Homestay", "Planter's Bungalow", "Old Town Heritage Home", "Country Roads Homestay", "Pine View Attic Homestay", "Blooming Garden Home", "Peaceful Sanctuary Homestay"],
            'Villas': ["Azure Ocean Villa", "Private Pool Luxury Villa", "Sunset Panorama Villa", "Royal Tuscan Villa", "Cliffside Glass Villa", "Palm Grove Private Villa", "Starlight Canopy Villa", "The Whispering Pines Villa", "Golden Hour Villa", "Serene Oasis Pool Villa", "The Heritage Mansion Villa", "Mountain Vista Chalet Villa"],
        }

        cat_counts = {'Hotels': 0, 'Resorts': 0, 'Homestays': 0, 'Villas': 0}

        for i in range(1, 55):
            room_id = i
            is_suite = (room_id in suite_ids)
            cat = categories_pool[i - 1]
            title_name = titles_by_cat[cat][cat_counts[cat] % len(titles_by_cat[cat])]
            cat_counts[cat] += 1

            if is_suite:
                title = f"Royal Suite - {title_name}"
                price = Decimal_val = round(random.uniform(7500, 18000), 2)
            else:
                title = title_name
                price = Decimal_val = round(random.uniform(1800, 6500), 2)

            city = cities[(i - 1) % len(cities)]
            image_url = images[(i - 1) % len(images)]
            rating = round(random.uniform(4.2, 4.95), 2)
            reviews = random.randint(12, 180)
            guests = random.choice([2, 3, 4, 6])
            desc = f"Experience luxury and ultimate comfort at {title} in {city}. Featuring modern amenities, panoramic views, free Wi-Fi, air conditioning, and 24/7 room service."

            room, created = Room.objects.update_or_create(
                id=room_id,
                defaults={
                    'title': title,
                    'hotel': f"{title_name} & Suites",
                    'city': city,
                    'max_guests': guests,
                    'category': cat,
                    'price': Decimal_val,
                    'imageUrl': image_url,
                    'rating': rating,
                    'total_reviews': reviews,
                    'availability': True if (i % 7 != 0) else False, # most available
                    'description': desc,
                    'is_suite': is_suite,
                    'host': host_user,
                }
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded 54 rooms (Suites: {sorted(list(suite_ids))})."))

        if options.get('with_orders'):
            self.stdout.write(self.style.NOTICE("Seeding 6 sample orders across the last 7 days..."))
            sample_rooms = Room.objects.filter(host=host_user, availability=True)[:6]
            today = timezone.now()

            statuses = ['placed', 'shipped', 'delivered', 'shipped', 'delivered', 'placed']
            payment_methods = ['COD', 'Pay Now', 'COD', 'Pay Now', 'COD', 'COD']
            meal_plans = ['With Breakfast', 'All Meals', 'Room Only', 'With Breakfast', 'All Meals', 'Room Only']

            for index, r in enumerate(sample_rooms):
                day_offset = index  # 0 to 5 days ago
                created_date = today - timedelta(days=day_offset)
                nights = random.choice([1, 2, 3])
                subtotal = r.price * nights
                status_val = statuses[index]
                pm = payment_methods[index]
                is_paid = (pm == 'Pay Now') or (status_val == 'delivered')

                order = Order.objects.create(
                    user=guest_user,
                    full_name="Arjun Kapoor",
                    phone_number="+91 9876543210",
                    street_address=f"{100 + index}, Park Street",
                    city="Bengaluru",
                    state="Karnataka",
                    pincode="560001",
                    payment_method=pm,
                    meal_plan=meal_plans[index],
                    total_price=subtotal,
                    status=status_val,
                    is_paid=is_paid,
                )
                # Override auto_now_add
                Order.objects.filter(id=order.id).update(created_at=created_date)

                item = OrderItem.objects.create(
                    order=order,
                    room=r,
                    host=host_user,
                    room_title=r.title,
                    hotel=r.hotel,
                    city=r.city,
                    imageUrl=r.imageUrl,
                    price=r.price,
                    quantity=nights,
                    subtotal=subtotal,
                    status=status_val,
                )
                OrderItem.objects.filter(id=item.id).update(created_at=created_date)

            self.stdout.write(self.style.SUCCESS("Successfully seeded sample orders with 7-day spread."))
