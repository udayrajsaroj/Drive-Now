const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    brand: { 
        type: String, 
        required: [true, 'Please add a brand'] 
    },
    model: { 
        type: String, 
        required: [true, 'Please add a model'] 
    },
    vehicleType: {
        type: String,
        required: [true, 'Please specify the vehicle type'],
        enum: ['Two-Wheeler', 'Hatchback', 'Sedan', 'SUV', 'Minivan', 'Commercial Van']
    },
    registrationNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    rentPerDay: { 
        type: Number, 
        required: [true, 'Please add the daily rental price'] 
    },
    seatingCapacity: { 
        type: Number, 
        required: true 
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['Petrol', 'Diesel', 'Electric', 'CNG']
    },
    transmission: {
        type: String,
        enum: ['Manual', 'Automatic', 'Not Applicable'],
        default: 'Manual'
    },
    // Core Status for Double-Booking Prevention
    availabilityStatus: {
        type: String,
        enum: ['Available', 'Booked', 'Maintenance'],
        default: 'Available'
    },
    // New: User ko dikhane ke liye ki gadi kab free hogi
    availableFrom: {
        type: Date,
        default: Date.now
    },
    imageUrl: { 
        type: String, 
        required: [true, 'Please upload a vehicle image'] 
    },
    
    // Dynamic Features (Frontend logic filters based on these)
    hasAC: { 
        type: Boolean, 
        default: false 
    }, 
    isHelmetIncluded: { 
        type: Boolean, 
        default: false 
    },
    
    // Optional: Reference to the current active booking
    currentBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    }

}, {
    timestamps: true 
});

// Middleware: Agar vehicle status update hota hai toh logic handles yahan lag sakte hain
vehicleSchema.pre('save', function(next) {
    if (this.availabilityStatus === 'Available') {
        this.availableFrom = Date.now();
    }
    next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);