const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); 
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express app
const app = express();

// --- AUTO-CREATE UPLOADS FOLDER ---
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
    console.log('✅ Created "uploads" folder successfully.');
}

// Middleware
app.use(cors());
app.use(express.json());

// Make the uploads folder static
app.use('/uploads', express.static(uploadsPath));

// --- Connect API Routes ---
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// --- ADDED: Razorpay Payment Routes ---
app.use('/api/payments', require('./routes/paymentRoutes')); 

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Vehicle Booking API is running...');
});

// Define the port (7000)
const PORT = process.env.PORT || 7000;

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});