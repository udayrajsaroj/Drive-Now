import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; // QR Code library

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(null); 
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return navigate('/login');

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const response = await axios.get('http://localhost:7000/api/bookings/mybookings', config);
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();

    // REAL-TIME UPDATE: Har 5 second mein status check karega
    const interval = setInterval(() => {
      fetchMyBookings();
    }, 5000); 

    return () => clearInterval(interval);
  }, [navigate]);

  // Helper function to handle Badge Colors and Text
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return { text: 'COMPLETED', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' };
      case 'Verified':
        return { text: 'PICKED UP', color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' };
      default:
        return { text: 'CONFIRMED', color: '#16a34a', bg: '#f0fdf4', border: '#dcfce7' };
    }
  };

  if (loading) return <div className="container"><h2>Loading your fleet access...</h2></div>;
  if (error) return <div className="container"><h2 style={{ color: 'red' }}>{error}</h2></div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: '800', color: '#1e293b' }}>My Bookings</h1>
        <button onClick={() => navigate('/browse')} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
          + New Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚲</div>
          <h3>No rides found!</h3>
          <p style={{ color: '#64748b' }}>You haven't booked any vehicles yet.</p>
          <button onClick={() => navigate('/browse')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Vehicles
          </button>
        </div>
      ) : (
        <div className="vehicle-grid">
          {bookings.map((booking) => {
            const badge = getStatusBadge(booking.status);
            return (
              <div key={booking._id} className="card" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                // Border color changes based on status
                borderTop: `6px solid ${badge.color}`,
                transition: 'all 0.3s ease',
                opacity: booking.status === 'Completed' ? 0.8 : 1 // Completed rides slightly faded
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'start' }}>
                    <h3 style={{ margin: '0', color: '#1e293b' }}>{booking.vehicle?.brand} {booking.vehicle?.model}</h3>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '800', 
                      letterSpacing: '0.05em',
                      color: badge.color, 
                      background: badge.bg, 
                      padding: '4px 10px', 
                      borderRadius: '20px',
                      border: `1px solid ${badge.border}`,
                      textTransform: 'uppercase'
                    }}>
                      {badge.text}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    <strong>Reg No:</strong> {booking.vehicle?.registrationNumber || 'N/A'}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ marginBottom: '0.6rem' }}>🗓️ <strong>Pickup:</strong> {new Date(booking.startDate).toDateString()}</div>
                    <div>🗓️ <strong>Drop:</strong> {new Date(booking.endDate).toDateString()}</div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>₹{booking.totalCost}</span>
                    
                    {/* QR button sirf tab dikhega jab status Verified ya Completed NA HO */}
                    {booking.status !== 'Verified' && booking.status !== 'Completed' && (
                      <button 
                        onClick={() => setShowQR(showQR === booking._id ? null : booking._id)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'underline' }}
                      >
                        {showQR === booking._id ? 'Close QR' : 'View QR Receipt'}
                      </button>
                    )}
                  </div>

                  {/* QR Display Logic */}
                  {showQR === booking._id && booking.status !== 'Verified' && booking.status !== 'Completed' && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '1.5rem', 
                      marginTop: '1.5rem',
                      background: '#fff', 
                      border: '2px dashed #cbd5e1', 
                      borderRadius: '16px',
                      animation: 'fadeIn 0.4s ease-out'
                    }}>
                      <QRCodeSVG value={booking._id} size={160} level={"H"} includeMargin={true} />
                      <p style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '1rem', fontWeight: '700' }}>
                        Admin will scan this to verify
                      </p>
                    </div>
                  )}
                  
                  {/* Status Messages */}
                  {booking.status === 'Verified' && (
                    <p style={{ marginTop: '1rem', color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center', background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                      ✅ Ride Started. Enjoy your journey!
                    </p>
                  )}

                  {booking.status === 'Completed' && (
                    <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center', background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                      🏁 Ride Completed. Thank you!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
      `}</style>
    </div>
  );
};

export default MyBookings;