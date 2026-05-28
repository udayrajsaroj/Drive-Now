import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Modal States
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', contact: '', role: '' });

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchUsers = async () => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const response = await axios.get('http://localhost:7000/api/users', config);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Access denied.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  // --- DELETE USER ---
  const deleteHandler = async (id, name) => {
    if (id === userInfo._id) return alert("Bhai, aap khud ko delete nahi kar sakte!");
    
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:7000/api/users/${id}`, config);
        alert('User deleted successfully');
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  // --- BLOCK/UNBLOCK USER (Toggle Status) ---
  const toggleStatus = async (user) => {
    if (user._id === userInfo._id) return alert("Bhai, khud ko block mat karo!");

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      // Hitting the new backend route: /api/users/status/:id
      const { data } = await axios.put(`http://localhost:7000/api/users/status/${user._id}`, {}, config);
      alert(data.message);
      fetchUsers();
    } catch (err) {
      alert('Status update failed');
    }
  };

  // --- EDIT MODAL LOGIC ---
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, contact: user.contact || '', role: user.role });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:7000/api/users/${editingUser._id}`, editFormData, config);
      alert('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div className="container"><h2>Loading system users...</h2></div>;

  return (
    <div className="card" style={{ overflowX: 'auto', padding: '1.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>👥</span>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Registered Users Management</h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={tdStyle}>
                <strong>{user.name}</strong>
                {user._id === userInfo._id && <span style={{ fontSize: '0.7rem', color: '#6366f1', marginLeft: '5px' }}>(You)</span>}
              </td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>
                <span style={roleBadge(user.role)}>{user.role}</span>
              </td>
              <td style={tdStyle}>
                <span style={{ 
                    color: user.isActive !== false ? '#16a34a' : '#dc2626', 
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                  <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: user.isActive !== false ? '#16a34a' : '#dc2626' }}></span>
                  {user.isActive !== false ? 'Active' : 'Blocked'}
                </span>
              </td>
              <td style={tdStyle}>
                <button onClick={() => openEditModal(user)} style={btnEdit}>Edit</button>
                <button 
                    onClick={() => toggleStatus(user)} 
                    style={{ ...btnBlock, color: user.isActive !== false ? '#dc2626' : '#16a34a' }}
                >
                  {user.isActive !== false ? 'Block' : 'Unblock'}
                </button>
                <button 
                    onClick={() => deleteHandler(user._id, user.name)} 
                    style={btnDelete}
                    disabled={user._id === userInfo._id}
                >
                    Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- EDIT MODAL --- */}
      {editingUser && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Edit User Details</h3>
                <button onClick={() => setEditingUser(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={inputGroup}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Contact Number</label>
                <input type="text" value={editFormData.contact} onChange={(e) => setEditFormData({...editFormData, contact: e.target.value})} style={inputStyle} />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Change Role</label>
                <select 
                    value={editFormData.role} 
                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value})} 
                    style={inputStyle}
                    disabled={editingUser._id === userInfo._id} // Admin can't change their own role to stay admin
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const thStyle = { padding: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' };
const tdStyle = { padding: '1rem', fontSize: '0.9rem', color: '#334155' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '5px' };
const inputGroup = { marginBottom: '1.2rem', textAlign: 'left' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' };

const roleBadge = (role) => ({
  backgroundColor: role === 'admin' ? '#fee2e2' : '#e0f2fe',
  color: role === 'admin' ? '#991b1b' : '#0369a1',
  padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
});

const btnEdit = { border: 'none', background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer', fontWeight: '600' };
const btnBlock = { border: '1px solid #e2e8f0', background: '#fff', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer', fontWeight: '600' };
const btnDelete = { border: 'none', background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' };
const modalContent = { backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };

export default ManageUsers;