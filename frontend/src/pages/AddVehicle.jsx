import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    vehicleType: 'Two-Wheeler',
    registrationNumber: '',
    rentPerDay: '',
    seatingCapacity: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    hasAC: false,
    isHelmetIncluded: false,
    image: null 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post('http://localhost:7000/api/vehicles', data, config);
      setSuccess('Vehicle added successfully with image!');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
          🚙 Add New Fleet Vehicle
        </h2>

        {error && <div style={{ color: '#991b1b', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
            
            {/* Left Column: Technical Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div className="form-group">
                <label>Brand</label>
                <input type="text" name="brand" className="form-control" value={formData.brand} onChange={handleChange} required placeholder="Honda, Hyundai..." />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" name="model" className="form-control" value={formData.model} onChange={handleChange} required placeholder="Activa, i20..." />
              </div>
              
              <div className="form-group">
                <label>Vehicle Type</label>
                <select name="vehicleType" className="form-control" value={formData.vehicleType} onChange={handleChange}>
                  <option value="Two-Wheeler">Two-Wheeler</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fuel Type</label>
                <select name="fuelType" className="form-control" value={formData.fuelType} onChange={handleChange}>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transmission</label>
                <select name="transmission" className="form-control" value={formData.transmission} onChange={handleChange}>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Not Applicable">Not Applicable (Scooters)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input type="text" name="registrationNumber" className="form-control" value={formData.registrationNumber} onChange={handleChange} required placeholder="MH-XX-XX-XXXX" />
              </div>

              <div className="form-group">
                <label>Rent / Day (₹)</label>
                <input type="number" name="rentPerDay" className="form-control" value={formData.rentPerDay} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Seating Capacity</label>
                <input type="number" name="seatingCapacity" className="form-control" value={formData.seatingCapacity} onChange={handleChange} required />
              </div>

              {/* Dynamic Checkboxes based on vehicle type */}
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px', marginTop: '10px' }}>
                {formData.vehicleType === 'Two-Wheeler' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="isHelmetIncluded" checked={formData.isHelmetIncluded} onChange={handleChange} />
                    Include Helmet?
                  </label>
                ) : (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="hasAC" checked={formData.hasAC} onChange={handleChange} />
                    Air Conditioning (AC)?
                  </label>
                )}
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Vehicle Photo</label>
              <div style={{ 
                width: '100%', 
                height: '240px', 
                border: '2px dashed #cbd5e1', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: '1.2rem',
                backgroundColor: '#f1f5f9'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</p>
                    <p>No image selected</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                required 
                style={{ width: '100%', fontSize: '0.85rem', color: '#475569' }}
              />
              
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fdf2f2', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b' }}>
                <strong>Note:</strong> Ensure the registration number and pricing are accurate before publishing to the database.
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              marginTop: '3rem', 
              width: '100%', 
              padding: '1.2rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '12px'
            }}
            disabled={uploading}
          >
            {uploading ? 'Processing Transaction...' : 'Publish Vehicle to Store'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;