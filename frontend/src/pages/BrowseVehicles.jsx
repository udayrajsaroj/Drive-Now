import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BrowseVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Fetch Vehicles with Cache Buster ---
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Timestamp add kiya hai taaki browser hamesha fresh data fetch kare
      const response = await axios.get(`http://localhost:7000/api/vehicles?t=${new Date().getTime()}`);
      setVehicles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vehicles. Is the server running?');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}><h2>Loading fleet...</h2></div>;
  if (error) return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}><h2 style={{ color: '#ef4444' }}>{error}</h2></div>;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem', fontWeight: '800', color: '#1e293b' }}>Available Fleet</h1>
      <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
        Premium two-wheelers and cars at your fingertips.
      </p>
      
      {vehicles.length === 0 ? (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <h3 style={{ color: '#475569' }}>No vehicles found</h3>
          <p style={{ color: '#94a3b8' }}>Check back later or contact admin to add inventory.</p>
        </div>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((vehicle) => {
            // CRITICAL: Match this exactly with your MongoDB 'availabilityStatus' value
            const isBooked = vehicle.availabilityStatus === 'Booked';
            
            return (
              <div key={vehicle._id} className="card vehicle-card" style={{ 
                padding: '0', 
                overflow: 'hidden', 
                opacity: isBooked ? '0.8' : '1',
                filter: isBooked ? 'grayscale(0.6)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                
                {/* Image Section */}
                <div style={{ width: '100%', height: '200px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                  <img 
                    src={vehicle.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image'} 
                    alt={vehicle.model} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Floating Badge for Booked Status */}
                  {isBooked && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      backgroundColor: '#ef4444', color: 'white',
                      padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.75rem',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', zIndex: '10'
                    }}>
                      NOT AVAILABLE
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0', color: '#1e293b' }}>
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: isBooked ? '#94a3b8' : '#2563eb', fontWeight: '800', fontSize: '1.2rem' }}>
                        ₹{vehicle.rentPerDay}
                      </span>
                      <small style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>per day</small>
                    </div>
                  </div>

                  {/* Specs Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <span className="badge-small">{vehicle.fuelType}</span>
                    <span className="badge-small">{vehicle.transmission}</span>
                    <span className="badge-small">{vehicle.seatingCapacity} Seater</span>
                  </div>

                  {/* Availability Info Area */}
                  <div style={{ 
                    padding: '1rem 0', 
                    borderTop: '1px solid #f1f5f9', 
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    minHeight: '3.5rem', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    {isBooked ? (
                      <div style={{ textAlign: 'center', width: '100%', backgroundColor: '#fff5f5', padding: '8px', borderRadius: '6px' }}>
                        <span style={{ color: '#ef4444', fontWeight: '700', display: 'block' }}>
                          🔒 Currently Rented
                        </span>
                        <span style={{ color: '#7f8ea3', fontSize: '0.8rem' }}>
                          Wait for return
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                        {vehicle.vehicleType === 'Two-Wheeler' 
                          ? (<span>🏍️ {vehicle.isHelmetIncluded ? 'Safety Helmet Included' : 'Standard Ride'}</span>)
                          : (<span>🚗 {vehicle.hasAC ? 'Air Conditioned' : 'Standard Comfort'}</span>)
                        }
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto' }}>
                    {isBooked ? (
                      <button disabled style={{ 
                        display: 'block', width: '100%', backgroundColor: '#e2e8f0', 
                        cursor: 'not-allowed', color: '#94a3b8', border: 'none',
                        padding: '0.85rem', borderRadius: '10px', fontWeight: '700',
                        fontSize: '0.95rem'
                      }}>
                        Already Booked
                      </button>
                    ) : (
                      <Link to={`/book/${vehicle._id}`} className="btn-primary-link" style={{ 
                        display: 'block', width: '100%', textAlign: 'center',
                        textDecoration: 'none', padding: '0.85rem', borderRadius: '10px',
                        backgroundColor: '#2563eb', color: 'white', fontWeight: '700',
                        fontSize: '0.95rem', transition: 'all 0.2s ease'
                      }}>
                        Book This Ride
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scoped CSS */}
      <style>{`
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2.5rem;
        }
        .vehicle-card {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        .vehicle-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .badge-small {
          background-color: #f1f5f9;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .btn-primary-link:hover {
          background-color: #1d4ed8 !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
};

export default BrowseVehicles;