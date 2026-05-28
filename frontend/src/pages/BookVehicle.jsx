import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/api/vehicles/${id}`);
        setVehicle(response.data);
      } catch (err) {
        setError('Vehicle not found');
      }
    };
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (dates.startDate && dates.endDate && vehicle) {
      const start = new Date(dates.startDate);
      const end = new Date(dates.endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysToCharge = diffDays <= 0 ? 1 : diffDays;
      setTotalCost(daysToCharge * vehicle.rentPerDay);
    }
  }, [dates, vehicle]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingAndPayment = async (e) => {
    e.preventDefault();
    if (!userInfo || !userInfo.token) {
      alert("Please login first!");
      return navigate('/login');
    }

    setLoading(true);

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // --- FIXED: Added Auth Config here too ---
      const config = { 
        headers: { Authorization: `Bearer ${userInfo.token}` } 
      };

      // Step B: Create Order on Backend (Fixed: Config added as 3rd parameter)
      const { data: order } = await axios.post(
        'http://localhost:7000/api/payments/order', 
        { amount: totalCost }, 
        config
      );

      // Step C: Open Razorpay Checkout
      const options = {
        key: "rzp_test_SWzo5l0K1hQ6CW", // FIXED: Key must be in quotes ""
        amount: order.amount,
        currency: order.currency,
        name: "DriveNow Rentals",
        description: `Booking for ${vehicle.brand} ${vehicle.model}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Step D: Verify Payment & Save Booking
            const bookingData = {
              vehicle: vehicle._id,
              startDate: dates.startDate,
              endDate: dates.endDate,
              totalCost: totalCost,
              paymentId: response.razorpay_payment_id
            };

            await axios.post('http://localhost:7000/api/bookings', bookingData, config);
            alert('Payment Successful & Vehicle Booked!');
            navigate('/dashboard');
          } catch (err) {
            alert("Payment verified but booking failed. Please contact support.");
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        theme: { color: "#2563eb" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      // Improved error logging
      console.error(err);
      setError(err.response?.data?.message || "Payment initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="container"><h2 style={{ color: 'red' }}>{error}</h2></div>;
  if (!vehicle) return <div className="container"><h2>Loading...</h2></div>;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '3rem auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <img src={vehicle.imageUrl} alt={vehicle.model} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem' }}>
              <h3>{vehicle.brand} {vehicle.model}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{vehicle.vehicleType}</p>
              <hr style={{ margin: '1rem 0', opacity: '0.1' }} />
              <div style={{ fontSize: '0.9rem', lineHeight: '2' }}>
                <p>⛽ <strong>Fuel:</strong> {vehicle.fuelType}</p>
                <p>⚙️ <strong>Transmission:</strong> {vehicle.transmission}</p>
                <p>🆔 <strong>Reg No:</strong> {vehicle.registrationNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Booking Details</h2>
          <form onSubmit={handleBookingAndPayment}>
            <div className="form-group">
              <label>Pick-up Date</label>
              <input type="date" name="startDate" className="form-control" onChange={(e) => setDates({...dates, startDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="form-group">
              <label>Drop-off Date</label>
              <input type="date" name="endDate" className="form-control" onChange={(e) => setDates({...dates, endDate: e.target.value})} required min={dates.startDate || new Date().toISOString().split('T')[0]} />
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius)', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Rental Price</span>
                <span>₹{vehicle.rentPerDay} / day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                <span>Total Amount</span>
                <span>₹{totalCost}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : 'Pay & Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookVehicle;