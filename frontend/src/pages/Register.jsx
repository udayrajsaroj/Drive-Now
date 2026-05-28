import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false); // Toggle between Form and OTP input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STEP 1: OTP Send karne ka logic ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Backend route jo sirf email check kare aur OTP bheje
      await axios.post('http://localhost:7000/api/users/send-otp', { email: formData.email });
      setIsOtpSent(true);
      alert(`OTP sent to ${formData.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: OTP Verify aur Final Registration ---
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Final payload with user data + OTP
      const response = await axios.post('http://localhost:7000/api/users/register-with-otp', {
        ...formData,
        otp
      });

      localStorage.setItem('userInfo', JSON.stringify(response.data));
      alert('Registration Successful! Welcome to Drive Now.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="card" style={{ padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontWeight: '800' }}>
          {isOtpSent ? 'Verify Email' : 'Join Drive Now'}
        </h2>
        
        {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        {!isOtpSent ? (
          // --- REGISTRATION FORM ---
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required placeholder="Kaushik Shetty" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required placeholder="kaushik@example.com" />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" name="contact" className="form-control" value={formData.contact} onChange={handleChange} required placeholder="9876543210" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '12px' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Get Started'}
            </button>
          </form>
        ) : (
          // --- OTP VERIFICATION VIEW ---
          <form onSubmit={handleVerifyAndRegister}>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We've sent a 6-digit code to <strong>{formData.email}</strong>. Please enter it below.
            </p>
            
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Enter OTP" 
                className="form-control" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 'bold' }}
                maxLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign Up'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setIsOtpSent(false)} 
              style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', marginTop: '1rem', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ← Edit Details
            </button>
          </form>
        )}
        
        {!isOtpSent && (
          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            Already a member? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;