const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getUserBookings, 
    getAllBookings, 
    verifyBooking,
    completeBooking // Naya controller function import karein
} = require('../controllers/bookingController');

// Auth middlewares to protect routes
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @desc    Main Bookings Route
 * POST: Create a new booking (User)
 * GET: Fetch all bookings in the system (Admin only)
 */
router.route('/')
    .post(protect, createBooking)
    .get(protect, admin, getAllBookings);

/**
 * @desc    Personal Bookings
 * GET: Returns only the bookings belonging to the current logged-in user
 */
router.get('/mybookings', protect, getUserBookings);

/**
 * @desc    QR Verification (Pickup Phase)
 * PUT: Scanner se status 'Verified' karne ke liye
 */
router.put('/verify/:id', protect, admin, verifyBooking);

/**
 * @desc    Complete Booking (Return Phase)
 * PUT: Gaadi wapas milne par status 'Completed' aur vehicle 'Available' karne ke liye
 */
router.put('/complete/:id', protect, admin, completeBooking);

module.exports = router;