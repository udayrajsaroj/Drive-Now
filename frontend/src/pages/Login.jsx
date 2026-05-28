import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state for better UX
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:7000/api/users/login', formData);
      
      // Save the user data and token to local storage
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      
      // Check role-based redirect
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        // Redirect regular customers to their Dashboard instead of just "/"
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '6rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Please enter your details to sign in
        </p>
        
        {error && (
          <div style={{ 
            color: '#991b1b', 
            backgroundColor: '#fee2e2', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius)', 
            marginBottom: '1.5rem', 
            textAlign: 'center',
            fontSize: '0.9rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="name@example.com"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              placeholder="••••••••"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Sign up for free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;