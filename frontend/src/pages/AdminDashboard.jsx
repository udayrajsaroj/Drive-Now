import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AddVehicle from './AddVehicle';
import ManageVehicles from './ManageVehicles';
import ManageBookings from './ManageBookings';
import ManageUsers from './ManageUsers';
import { Html5Qrcode } from 'html5-qrcode'; 

// --- 1. QR Scanner Modal Component ---
const QRScannerModal = ({ onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);
  const isInitializing = useRef(false);

  useLayoutEffect(() => {
    const readerElement = document.getElementById("reader");
    if (readerElement) readerElement.innerHTML = "";

    if (isInitializing.current) return;
    isInitializing.current = true;

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              onScanSuccess(decodedText);
            }).catch(err => console.error("Stop error:", err));
          },
          () => {} 
        );
      } catch (err) {
        console.error("Scanner start failed:", err);
        isInitializing.current = false;
      }
    };

    startScanner();

    return () => {
      isInitializing.current = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
          }).catch(err => console.log("Cleanup silent fail", err));
        } else {
          try { scannerRef.current.clear(); } catch (e) {}
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '700' }}>Verify Booking QR</h3>
          <button onClick={onClose} style={closeButtonStyle}>&times;</button>
        </div>
        <div id="reader" style={readerStyles}></div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
          Align the QR code to verify. The camera will close automatically upon success.
        </p>
      </div>
    </div>
  );
};

// --- 2. Dashboard Overview Component ---
const DashboardOverview = () => {
  const [stats, setStats] = useState({ earnings: 0, active: 0, fleet: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const [bookingsRes, vehiclesRes] = await Promise.all([
        axios.get('http://localhost:7000/api/bookings', config),
        axios.get('http://localhost:7000/api/vehicles', config)
      ]);

      const allBookings = bookingsRes.data;
      const totalEarnings = allBookings.reduce((acc, curr) => acc + curr.totalCost, 0);
      
      setStats({
        earnings: totalEarnings,
        active: allBookings.filter(b => b.status === 'Confirmed').length,
        fleet: vehiclesRes.data.length
      });

      setRecentBookings(allBookings.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error("Dashboard error", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    setShowScanner(false); 
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const { data } = await axios.put(`http://localhost:7000/api/bookings/verify/${decodedText}`, {}, config);
      
      alert(`
✅ VERIFICATION SUCCESSFUL!
---------------------------
Customer: ${data.user?.name || 'User'}
Vehicle: ${data.vehicle?.brand || ''} ${data.vehicle?.model || 'Vehicle'}
Total Paid: ₹${data.totalCost}
---------------------------
Status: Authorized for pickup.
      `);
      
      fetchDashboardData(); 
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || "Invalid QR Code"));
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}><h3>Loading Analytics...</h3></div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: '700', color: '#1e293b' }}>Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div style={statsGridStyle}>
        <div className="card" style={{ ...cardBaseStyle, borderLeft: '6px solid #2563eb' }}>
          <p style={statLabelStyle}>Total Revenue</p>
          <h2 style={statValueStyle}>₹{stats.earnings.toLocaleString()}</h2>
        </div>
        <div className="card" style={{ ...cardBaseStyle, borderLeft: '6px solid #22c55e' }}>
          <p style={statLabelStyle}>Live Bookings</p>
          <h2 style={statValueStyle}>{stats.active}</h2>
        </div>
        <div className="card" style={{ ...cardBaseStyle, borderLeft: '6px solid #f59e0b' }}>
          <p style={statLabelStyle}>Fleet Size</p>
          <h2 style={statValueStyle}>{stats.fleet}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ minHeight: '350px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={sectionHeaderStyle}>Recent Activity</h3>
          {recentBookings.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8' }}>No recent transactions.</p>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking._id} style={activityRowStyle}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{booking.user?.name || 'Customer'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.vehicle?.brand} {booking.vehicle?.model}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#16a34a', fontWeight: '700' }}>+ ₹{booking.totalCost}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(booking.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/admin/add-vehicle" className="btn btn-primary" style={actionButtonStyle}>+ Add New Vehicle</Link>
            <button className="btn" onClick={() => setShowScanner(true)} style={scannerButtonStyle}>
              📷 Launch QR Scanner
            </button>
            <Link to="/admin/bookings" className="btn" style={secondaryButtonStyle}>📅 View All Bookings</Link>
          </div>
        </div>
      </div>

      {showScanner && <QRScannerModal onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} />}
    </div>
  );
};

// --- Main Admin Dashboard Wrapper ---
const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="admin-content" style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
          Admin Panel / <span style={{ color: '#2563eb' }}>{location.pathname.split('/').pop() || 'Overview'}</span>
        </p>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/manage-vehicles" element={<ManageVehicles />} />
          <Route path="/bookings" element={<ManageBookings />} />
          <Route path="/users" element={<ManageUsers />} />
        </Routes>
      </div>
    </div>
  );
};

// --- Styles Object ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
};
const modalContentStyle = {
  backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
};
const readerStyles = { 
  width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e2e8f0', backgroundColor: '#000', minHeight: '250px' 
};
const closeButtonStyle = {
  cursor: 'pointer', border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '38px', height: '38px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' };
const cardBaseStyle = { padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', borderRadius: '12px' };
const statLabelStyle = { color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', margin: 0 };
const statValueStyle = { fontSize: '2rem', marginTop: '0.5rem', color: '#1e293b', fontWeight: '800' };
const sectionHeaderStyle = { marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', color: '#1e293b' };
const activityRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f1f5f9' };
const actionButtonStyle = { textAlign: 'center', textDecoration: 'none', padding: '14px', fontWeight: '700', borderRadius: '8px' };
const scannerButtonStyle = { padding: '14px', cursor: 'pointer', borderRadius: '8px', border: '2px solid #2563eb', color: '#2563eb', fontWeight: '800', backgroundColor: '#eff6ff' };
const secondaryButtonStyle = { textAlign: 'center', textDecoration: 'none', padding: '14px', color: '#475569', border: '1px solid #e2e8f0', fontWeight: '600', borderRadius: '8px', marginTop: '8px' };

export default AdminDashboard;