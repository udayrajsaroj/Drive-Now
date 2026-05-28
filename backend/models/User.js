const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    contact: { 
        type: String, 
        required: [true, 'Please add a contact number'],
        match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit Indian mobile number']
    },
    role: { 
        type: String, 
        enum: ['customer', 'admin'], 
        default: 'customer' 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // --- OTP SIGNUP FIELDS ---
    isVerified: {
        type: Boolean,
        default: false // Jab tak OTP verify na ho, false rahega
    },
    otp: {
        type: String
    },
    otpExpire: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);