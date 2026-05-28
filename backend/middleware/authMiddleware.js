const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Make sure the user is logged in
const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer <token_string>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload (excluding the password)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move on to the next piece of middleware or the controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin routes - Make sure the logged-in user is an Admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };