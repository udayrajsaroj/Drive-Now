import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const isAdmin = userInfo && userInfo.role === 'admin';
  const isCurrentlyOnAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="navbar" style={navStyle}>
      <div className="nav-container" style={containerStyle}>
        
        {/* Zone 1: The Logo (Full Left) */}
        <div className="nav-brand" style={{ flex: '0 1 auto' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>🚗</span>
            <span style={{ color: '#1e293b' }}>Drive</span>
            <span style={{ color: '#2563eb' }}>Now</span>
            {isAdmin && (
              <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: '8px', border: '1px solid #f59e0b', padding: '2px 6px', borderRadius: '4px' }}>
                ADMIN
              </span>
            )}
          </Link>
        </div>
        
        {/* Zone 2: Middle Menu (Centered if needed, or pushed) */}
        {!isAdmin && (
          <div className="nav-menu" style={menuStyle}>
            <NavLink to="/vehicles" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Browse Vehicles
            </NavLink>
            
            {userInfo && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  Dashboard
                </NavLink>
                <NavLink to="/my-bookings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  My Bookings
                </NavLink>
              </>
            )}
          </div>
        )}

        {/* Zone 3: Actions (Full Right) */}
        <div className="user-actions" style={actionsStyle}>
          {userInfo ? (
            <>
              {isAdmin && !isCurrentlyOnAdminPage && (
                <Link to="/admin" className="btn-admin-link">
                  ⚡ Admin Panel
                </Link>
              )}
              
              {!isAdmin && (
                <Link to="/dashboard" className="user-badge-link">
                  👤 {userInfo.name.split(' ')[0]}
                </Link>
              )}
              
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link to="/login" className="nav-link-simple">Log In</Link>
              <Link to="/register" className="get-started-btn">
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Inline Styles for Layout Fix */}
      <style>{`
        .navbar {
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 0.8rem 2rem;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-link {
          text-decoration: none;
          color: #64748b;
          font-weight: 600;
          padding: 0.5rem 1rem;
          transition: 0.3s;
        }
        .nav-link.active {
          color: #2563eb;
        }
        .btn-admin-link {
          text-decoration: none;
          border: 1px solid #f59e0b;
          color: #d97706;
          padding: 0.5rem 1.2rem;
          borderRadius: 50px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .user-badge-link {
          text-decoration: none;
          color: #1e293b;
          font-weight: 700;
          margin-right: 1rem;
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 50px;
        }
        .logout-btn {
          background: #fee2e2;
          color: #991b1b;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.3s;
        }
        .logout-btn:hover {
          background: #fecaca;
        }
        .get-started-btn {
          text-decoration: none;
          background: #2563eb;
          color: white;
          padding: 0.7rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
        }
        .nav-link-simple {
          text-decoration: none;
          color: #1e293b;
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
};

// Layout Object Styles
const navStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center'
};

const containerStyle = {
  width: '100%',
  maxWidth: '1400px', // Full width layout
  display: 'flex',
  justifyContent: 'space-between', // Logo left, Actions right
  alignItems: 'center'
};

const menuStyle = {
  display: 'flex',
  gap: '1rem',
  position: 'absolute', // To keep it centered if possible
  left: '50%',
  transform: 'translateX(-50%)'
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flex: '0 1 auto'
};

export default Navbar;