import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', password: '' });
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchMyBookings = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const response = await axios.get('http://localhost:7000/api/bookings/mybookings', config);
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings", err);
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [navigate]);

  // --- Profile Update Logic ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put('http://localhost:7000/api/users/profile', formData, config);
      
      // Update local storage with new info (including new token if generated)
      localStorage.setItem('userInfo', JSON.stringify(data));
      alert("Profile Updated Successfully! ✅");
      setShowModal(false);
      window.location.reload(); // Refresh to show new data
    } catch (err) {
      alert(err.response?.data?.message || "Update Failed");
    }
  };

  const openModal = () => {
    setFormData({ 
      name: userInfo.name, 
      contact: userInfo.contact || '', 
      password: '' 
    });
    setShowModal(true);
  };

  if (loading) return <div className="container"><h2>Loading Dashboard...</h2></div>;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease' }}>
        <h1 style={{ fontWeight: '800', color: '#1e293b' }}>Welcome back, {userInfo.name}! 👋</h1>
        <p style={{ color: '#64748b' }}>Manage your rentals and account settings here.</p>
      </header>

      {/* Stat Cards Section */}
      <div className="vehicle-grid" style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', borderBottom: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '2rem' }}>📅</span>
          <h3 style={{ marginTop: '0.5rem', fontSize: '1.8rem' }}>{bookings.length}</h3>
          <p style={{ color: '#64748b', fontWeight: '600' }}>Total Bookings</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderBottom: '4px solid #16a34a' }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          <h3 style={{ marginTop: '0.5rem', fontSize: '1.8rem' }}>
            ₹{bookings.reduce((acc, item) => acc + item.totalCost, 0).toLocaleString()}
          </h3>
          <p style={{ color: '#64748b', fontWeight: '600' }}>Total Spent</p>
        </div>
        <div className="card" style={{ textAlign: 'center', borderBottom: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '2rem' }}>⭐</span>
          <h3 style={{ marginTop: '0.5rem', fontSize: '1.8rem' }}>Premium</h3>
          <p style={{ color: '#64748b', fontWeight: '600' }}>Member Status</p>
        </div>
      </div>

      <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Recent Bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1e293b' }}>Recent Bookings</h2>
            <Link to="/my-bookings" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem' }}>View All →</Link>
          </div>

          {bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>You haven't made any bookings yet.</p>
              <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Find a Vehicle</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '10px' }}>🚗</div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{booking.vehicle?.brand} {booking.vehicle?.model}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>₹{booking.totalCost}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Account Details */}
        <div>
          <h2 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>Account Details</h2>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '20px' }}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</label>
              <p style={{ fontWeight: '600', color: '#1e293b', marginTop: '4px' }}>{userInfo.name}</p>
            </div>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</label>
              <p style={{ fontWeight: '600', color: '#1e293b', marginTop: '4px' }}>{userInfo.email}</p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Phone Number</label>
              <p style={{ fontWeight: '600', color: '#1e293b', marginTop: '4px' }}>{userInfo.contact || 'Not provided'}</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={openModal}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* --- PROFILE EDIT MODAL --- */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Update Profile</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div style={inputGroup}>
                <label style={labelStyle}>Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  style={inputStyle} 
                />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Contact Number</label>
                <input 
                  type="text" 
                  value={formData.contact} 
                  onChange={(e) => setFormData({...formData, contact: e.target.value})} 
                  style={inputStyle} 
                  placeholder="e.g. +91 9876543210"
                />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>New Password (Leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  style={inputStyle} 
                  placeholder="••••••••"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .dashboard-layout { display: grid; }
        @media (max-width: 768px) {
          .dashboard-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

// --- Modal Styles ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' };
const modalContent = { backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const inputGroup = { marginBottom: '1.2rem' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' };

export default UserDashboard;