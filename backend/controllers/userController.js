const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Utility Function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Step 1: Send OTP to Email
// @route   POST /api/users/send-otp
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists && userExists.isVerified) {
            return res.status(400).json({ message: 'User already exists and is verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes validity

        await User.findOneAndUpdate(
            { email },
            { otp, otpExpire, isVerified: false },
            { upsert: true, new: true }
        );

        const emailMessage = `
            <div style="font-family: Arial; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2563eb;">Drive Now Verification</h2>
                <p>Aapka OTP registration ke liye niche diya gaya hai:</p>
                <h1 style="letter-spacing: 5px; color: #1e293b; text-align: center;">${otp}</h1>
                <p style="font-size: 0.8rem; color: #64748b;">Ye code 10 minute tak valid hai. Kise ke saath share na karein.</p>
            </div>
        `;

        await sendEmail({
            email,
            subject: 'Drive Now - Registration OTP',
            message: emailMessage
        });

        res.status(200).json({ message: 'OTP sent successfully to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Step 2: Verify OTP and Register User
// @route   POST /api/users/register-with-otp
const registerWithOTP = async (req, res) => {
    try {
        const { name, email, password, contact, otp, role } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.name = name;
        user.password = hashedPassword;
        user.contact = contact;
        user.role = role || 'customer';
        user.isVerified = true;
        user.otp = undefined; 
        user.otpExpire = undefined;
        user.isActive = true;

        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            contact: user.contact,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user & get token
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email via OTP first' });
            }
            if (user.isActive === false) {
                return res.status(403).json({ message: 'Your account has been blocked by Admin.' });
            }

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                contact: user.contact,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Private/Self)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.contact = req.body.contact || user.contact;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                contact: updatedUser.contact,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user by Admin (MISING FUNCTION FIXED)
// @route   PUT /api/users/:id
const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.contact = req.body.contact || user.contact;
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user status (Block/Unblock)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') return res.status(400).json({ message: "Cannot block admin" });
            user.isActive = !user.isActive;
            await user.save();
            res.json({ message: `User ${user.isActive ? 'Unblocked' : 'Blocked'}` });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') return res.status(400).json({ message: "Cannot delete admin" });
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    sendOTP,
    registerWithOTP,
    loginUser, 
    getUsers, 
    updateUserProfile, 
    updateUserByAdmin, // <--- Add this
    deleteUser, 
    toggleUserStatus, 
};