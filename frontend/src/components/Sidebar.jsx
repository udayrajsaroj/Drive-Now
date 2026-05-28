import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdDirectionsCar, 
  MdEventNote, 
  MdPeople, 
  MdAddBox 
} from 'react-icons/md'; // Professional Material Design Icons

const Sidebar = () => {
  return (
    <aside className="sidebar" style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      position: 'sticky',
      top: 0
    }}>
      
      <div style={{ padding: '0 0.5rem 2rem 0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2563eb' }}>ADMIN PANEL</h2>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>Drive Now Fleet v1.0</p>
      </div>

      <NavLink 
        to="/admin" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        end
        style={navLinkStyle}
      >
        <MdDashboard size={20} /> Dashboard Overview
      </NavLink>

      <NavLink 
        to="/admin/manage-vehicles" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        style={navLinkStyle}
      >
        <MdDirectionsCar size={20} /> Manage Inventory
      </NavLink>

      <NavLink 
        to="/admin/add-vehicle" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        style={navLinkStyle}
      >
        <MdAddBox size={20} /> Add New Vehicle
      </NavLink>

      <NavLink 
        to="/admin/bookings" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        style={navLinkStyle}
      >
        <MdEventNote size={20} /> Manage Bookings
      </NavLink>

      <NavLink 
        to="/admin/users" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        style={navLinkStyle}
      >
        <MdPeople size={20} /> Manage Users
      </NavLink>

      {/* Internal CSS for Active State & Hover */}
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: #64748b;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          background-color: #f8fafc;
          color: #2563eb;
        }
        .sidebar-link.active {
          background-color: #eff6ff;
          color: #2563eb;
          box-shadow: inset 4px 0 0 -1px #2563eb;
        }
      `}</style>
    </aside>
  );
};

// Common style object to keep it clean
const navLinkStyle = {
  // Styles handled by the <style> tag above
};

export default Sidebar;