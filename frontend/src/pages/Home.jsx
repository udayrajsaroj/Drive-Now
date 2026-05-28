import { Link } from 'react-router-dom';

const Home = () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Determine the correct dashboard path based on role
  const dashboardPath = userInfo?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>Find Your Perfect Ride</h1>
        <p>Choose from hundreds of vehicles at the best prices. Book online and drive away!</p>
        <div className="hero-buttons">
          {/* Admin ko browse vehicles dikhane ki zarurat nahi hai logic ke hisaab se, 
              isliye hum isse bhi wrap kar sakte hain agar chahein */}
          {userInfo?.role !== 'admin' && (
            <Link to="/vehicles" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Browse Vehicles
            </Link>
          )}

          {!userInfo ? (
            <Link to="/register" className="btn btn-outline" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Sign Up Now
            </Link>
          ) : (
            /* Yahan dashboardPath dynamic ho gaya hai */
            <Link to={dashboardPath} className="btn btn-outline" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Go to {userInfo.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </Link>
          )}
        </div>
      </section>

      {/* Rest of the section remains same */}
      <section className="features-section">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How It Works</h2>
        <p style={{ color: 'var(--text-muted)' }}>Get on the road in four simple steps.</p>
        
        <div className="features-grid">
          <div className="feature-step">
            <div className="step-circle">1</div>
            <h3>Search</h3>
            <p>Browse our wide selection of vehicles</p>
          </div>
          <div className="feature-step">
            <div className="step-circle">2</div>
            <h3>Book</h3>
            <p>Select your dates and complete booking</p>
          </div>
          <div className="feature-step">
            <div className="step-circle">3</div>
            <h3>Pay</h3>
            <p>Secure online payment options</p>
          </div>
          <div className="feature-step">
            <div className="step-circle">4</div>
            <h3>Drive</h3>
            <p>Pick up your car and hit the road</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;