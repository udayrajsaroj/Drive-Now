import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';       
import Register from './pages/Register';
import BrowseVehicles from './pages/BrowseVehicles'; 
import Home from './pages/Home'; 
import BookVehicle from './pages/BookVehicle';
import MyBookings from './pages/MyBookings';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<BrowseVehicles />} /> 
        <Route path="/book/:id" element={<BookVehicle />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin/*" element={<AdminDashboard />} /> 
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;