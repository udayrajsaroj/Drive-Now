import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [newImage, setNewImage] = useState(null);

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:7000/api/vehicles');
      setVehicles(response.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleEditClick = (vehicle) => {
    setEditFormData({ ...vehicle });
    setNewImage(null);
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    // Saara data append karein
    Object.keys(editFormData).forEach(key => {
      if (key !== 'imageUrl') data.append(key, editFormData[key]);
    });
    if (newImage) data.append('image', newImage);

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}` 
        },
      };
      await axios.put(`http://localhost:7000/api/vehicles/${editFormData._id}`, data, config);
      alert('Vehicle Updated!');
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || 'Check backend console'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:7000/api/vehicles/${id}`, config);
      setVehicles(vehicles.filter(v => v._id !== id));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Manage Inventory</h1>
        <button onClick={() => navigate('/admin/add-vehicle')} className="btn btn-primary">+ Add New</button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Vehicle</th>
              <th style={{ padding: '1rem' }}>Reg. No</th>
              <th style={{ padding: '1rem' }}>Rent</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={v.imageUrl} style={{ width: '50px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  <strong>{v.brand} {v.model}</strong>
                </td>
                <td style={{ padding: '1rem' }}>{v.registrationNumber}</td>
                <td style={{ padding: '1rem' }}>₹{v.rentPerDay}</td>
                <td style={{ padding: '1rem' }}>{v.availabilityStatus}</td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleEditClick(v)} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(v._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EDIT MODAL --- */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Edit Vehicle Details</h3>
            <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <div className="form-group">
                <label>Brand</label>
                <input type="text" className="form-control" value={editFormData.brand} onChange={(e) => setEditFormData({...editFormData, brand: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" className="form-control" value={editFormData.model} onChange={(e) => setEditFormData({...editFormData, model: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Fuel Type</label>
                <select className="form-control" value={editFormData.fuelType} onChange={(e) => setEditFormData({...editFormData, fuelType: e.target.value})}>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">EV</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rent / Day</label>
                <input type="number" className="form-control" value={editFormData.rentPerDay} onChange={(e) => setEditFormData({...editFormData, rentPerDay: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Update Photo (Optional)</label>
                <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle = {
  backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

export default ManageVehicles;