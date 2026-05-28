import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Fetch All Bookings ---
  const fetchAllBookings = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const response = await axios.get('http://localhost:7000/api/bookings', config);
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings. Access Denied.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [navigate]);

  // --- Logic to Complete Booking (Return Vehicle) ---
  const handleComplete = async (id) => {
    if (window.confirm('Mark this vehicle as returned? This will make the vehicle Available again.')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        // PUT request to update status to 'Completed' and release vehicle
        await axios.put(`http://localhost:7000/api/bookings/complete/${id}`, {}, config);
        
        alert('Success! Vehicle is now back in inventory.');
        fetchAllBookings(); // List refresh karo
      } catch (err) {
        // "next is not a function" ya koi aur backend error yahan handle hoga
        const message = err.response?.data?.message || "Server configuration error";
        alert('Action failed: ' + message);
      }
    }
  };

  // --- Helper function for status colors ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': 
        return { bg: '#eff6ff', text: '#2563eb', label: 'In Use (Verified)' }; 
      case 'Completed': 
        return { bg: '#f0fdf4', text: '#16a34a', label: 'Returned' }; 
      case 'Confirmed': 
        return { bg: '#fff7ed', text: '#c2410c', label: 'Awaiting Pickup' }; 
      default: 
        return { bg: '#f1f5f9', text: '#475569', label: status };
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}><h2>Loading system bookings...</h2></div>;
  if (error) return <div style={{ padding: '2rem' }}><h2 style={{ color: 'red' }}>{error}</h2></div>;

  return (
    <div style={{ padding: '20px' }}>
      <div className="card" style={{ 
        overflowX: 'auto', 
        padding: '1.5rem', 
        backgroundColor: '#fff', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <h2 style={{ 
          marginBottom: '1.5rem', 
          borderBottom: '1px solid #e2e8f0', 
          paddingBottom: '1rem', 
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📅 All System Bookings
        </h2>

        {bookings.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            No bookings have been made yet in the system.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>CUSTOMER</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>VEHICLE</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>DATES</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>TOTAL</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>STATUS</th>
                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{booking.user?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.user?.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>{booking.vehicle?.brand}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.vehicle?.model}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#334155' }}>
                    <strong>{new Date(booking.startDate).toLocaleDateString()}</strong> <br/>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>to</span> <br/>
                    <strong>{new Date(booking.endDate).toLocaleDateString()}</strong>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#2563eb' }}>
                    ₹{booking.totalCost}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.7rem', 
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      backgroundColor: getStatusColor(booking.status).bg,
                      color: getStatusColor(booking.status).text
                    }}>
                      {getStatusColor(booking.status).label}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {/* Action logic based on Status */}
                    {booking.status === 'Verified' ? (
                      <button 
                        onClick={() => handleComplete(booking._id)}
                        className="btn-complete"
                        style={{ 
                          backgroundColor: '#1e293b', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '8px 14px', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                      >
                        Mark Returned
                      </button>
                    ) : booking.status === 'Completed' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#22c55e', fontWeight: '600', fontSize: '0.8rem' }}>
                        Done ✅
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        Waiting for Pickup
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <style>{`
        .table-row:hover {
          background-color: #fcfcfd;
        }
        .btn-complete:hover {
          background-color: #334155 !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default ManageBookings;