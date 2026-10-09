import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'COD',
    meal_plan: 'Room Only',
  });

  useEffect(() => {
    async function load() {
      await fetchCart();
      setLoading(false);
    }
    load();
  }, [fetchCart]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/orders/checkout/', {
        method: 'POST',
        body: form,
      });
      clearCart();
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading checkout..." />;

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Add rooms to your cart before checking out."
          actionText="Browse Rooms"
          actionLink="/rooms"
        />
      </div>
    );
  }

  return (
    <div className="checkout-page" id="checkout-page">
      <h1>Checkout</h1>

      {error && <ErrorMessage message={error} />}

      <div className="checkout-grid">
        <form className="checkout-form-section" onSubmit={handleSubmit}>
          <h3>Delivery Details</h3>

          <div className="form-group">
            <label htmlFor="checkout-name">Full Name</label>
            <input id="checkout-name" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-phone">Phone Number</label>
            <input id="checkout-phone" name="phone_number" value={form.phone_number} onChange={handleChange} required placeholder="+91 XXXXXXXXXX" />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-address">Street Address</label>
            <input id="checkout-address" name="street_address" value={form.street_address} onChange={handleChange} required placeholder="Street address" />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="checkout-city">City</label>
              <input id="checkout-city" name="city" value={form.city} onChange={handleChange} required placeholder="City" />
            </div>
            <div className="form-group">
              <label htmlFor="checkout-state">State</label>
              <input id="checkout-state" name="state" value={form.state} onChange={handleChange} required placeholder="State" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="checkout-pincode">Pincode</label>
            <input id="checkout-pincode" name="pincode" value={form.pincode} onChange={handleChange} required placeholder="6-digit pincode" />
          </div>

          <h3 style={{ marginTop: '24px' }}>Booking Options</h3>

          <div className="form-group">
            <label htmlFor="checkout-payment">Payment Method</label>
            <select id="checkout-payment" name="payment_method" value={form.payment_method} onChange={handleChange}>
              <option value="COD">Pay at Hotel (COD)</option>
              <option value="Pay Now">Pay Now</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="checkout-meal">Meal Plan</label>
            <select id="checkout-meal" name="meal_plan" value={form.meal_plan} onChange={handleChange}>
              <option value="Room Only">Room Only</option>
              <option value="With Breakfast">With Breakfast</option>
              <option value="All Meals">All Meals</option>
            </select>
          </div>

          <button type="submit" className="btn btn-accent btn-block btn-lg" disabled={submitting} id="place-order-btn">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary-section">
          <h3>Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className="checkout-item">
              <div className="checkout-item-title">
                {item.room_title} <br />
                <small style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  {item.quantity} night(s) × ₹{Number(item.price).toLocaleString('en-IN')}
                </small>
              </div>
              <div className="checkout-item-price">₹{Number(item.subtotal).toLocaleString('en-IN')}</div>
            </div>
          ))}
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>₹{Number(cart.total_price).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
