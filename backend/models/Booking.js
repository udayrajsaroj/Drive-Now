const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    vehicle: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehicle', 
        required: true 
    },
    startDate: { 
        type: Date, 
        required: [true, 'Please select a start date'] 
    },
    endDate: { 
        type: Date, 
        required: [true, 'Please select an end date'] 
    },
    totalCost: { 
        type: Number, 
        required: true 
    },
    // Status flow: Pending -> Confirmed (Paid) -> Verified (QR Scanned) -> Completed (Returned)
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Verified', 'Cancelled', 'Completed'], 
        default: 'Confirmed' 
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Paid' 
    },
    paymentId: {
        type: String, // Razorpay Order/Payment ID
        required: true
    },
    qrCodeToken: {
        type: String // Unique token for Admin QR scanning verification
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);