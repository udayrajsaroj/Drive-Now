const express = require('express');
const router = express.Router();
const { 
    sendOTP, 
    registerWithOTP, 
    loginUser, 
    getUsers, 
    updateUserProfile,
    deleteUser,
    updateUserByAdmin, 
    toggleUserStatus 
} = require('../controllers/userController');

// Authentication & Admin middlewares
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @desc    Public Routes (Auth & OTP Signup)
 */

// Step 1: Send OTP to User's Email
router.post('/send-otp', sendOTP);

// Step 2: Verify OTP and finalize Registration
router.post('/register-with-otp', registerWithOTP);

// Step 3: Normal User Login
router.post('/login', loginUser);

/**
 * @desc    Private Route (Logged in users)
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @desc    Admin Routes (Protected + Admin only)
 */

// 1. Get all users (List view)
router.route('/')
    .get(protect, admin, getUsers);

// 2. Block/Unblock User (Status Toggle)
// Frontend URL: /api/users/status/:id
router.put('/status/:id', protect, admin, toggleUserStatus);

// 3. Delete and Edit User Details by Admin
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUserByAdmin);

module.exports = router;