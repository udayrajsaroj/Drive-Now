const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * @desc    Create new booking & Send Confirmation Email
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
    try {
        const { vehicle, startDate, endDate, totalCost, paymentId } = req.body;

        // 1. Check if vehicle exists
        const vehicleExists = await Vehicle.findById(vehicle);
        if (!vehicleExists) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // 2. Double-booking prevention check
        if (vehicleExists.availabilityStatus === 'Booked') {
            return res.status(400).json({ message: 'Bhai, ye gaadi abhi kisi aur ne book kar li hai!' });
        }

        // 3. Generate a Unique QR Token for Verification
        const qrToken = crypto.randomBytes(16).toString('hex');

        // 4. Create Booking in DB
        const booking = await Booking.create({
            user: req.user._id,
            vehicle,
            startDate,
            endDate,
            totalCost,
            paymentId,
            qrCodeToken: qrToken,
            status: 'Confirmed'
        });

        // 5. Update vehicle status atomically
        await Vehicle.findByIdAndUpdate(vehicle, {
            availabilityStatus: 'Booked',
            availableFrom: endDate
        });

        // --- NODEMAILER LOGIC WITH PICKUP DETAILS ---
        const pickupAddress = "Drive Now Main Hub, Gauraipada, Vasai East, Mumbai - 401208";
        const mapLink = "https://maps.app.goo.gl/uvf9d6JARDjoNiZp8";

        const emailMessage = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #2563eb; color: white; padding: 25px; text-align: center;">
                    <h1 style="margin:0;">Drive Now Confirmed! 🚗</h1>
                </div>
                <div style="padding: 20px; color: #1e293b;">
                    <p>Hi <strong>${req.user.name}</strong>, aapki ride confirm ho gayi hai.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #2563eb;">📍 Pickup Information</h4>
                        <p style="margin: 0; font-size: 0.95rem;"><strong>Location:</strong> ${pickupAddress}</p>
                        <p style="margin: 8px 0 0 0;"><a href="${mapLink}" style="color: #2563eb; font-weight: bold; text-decoration: none;">Open in Google Maps ➔</a></p>
                    </div>

                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${vehicleExists.brand} ${vehicleExists.model}</p>
                        <p style="margin: 5px 0;"><strong>Dates:</strong> ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Total Paid:</strong> ₹${totalCost}</p>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 0.85rem; color: #64748b;">
                        * Pickup ke waqt apna <strong>Original License</strong> aur <strong>QR Code</strong> dashboard se saath layein.
                    </p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: req.user.email,
                subject: `Booking Confirmed: ${vehicleExists.brand} ${vehicleExists.model}`,
                message: emailMessage
            });
        } catch (err) {
            console.error("Email failed but booking is safe:", err.message);
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get logged in user's bookings
 * @route   GET /api/bookings/mybookings
 */
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('vehicle', 'brand model registrationNumber imageUrl')
            .sort({ createdAt: -1 });
            
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all bookings (Admin View)
 * @route   GET /api/bookings
 */
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('vehicle', 'brand model registrationNumber')
            .sort({ createdAt: -1 });
            
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Verify booking via QR Scan (Pickup Phase)
 * @route   PUT /api/bookings/verify/:id
 * FIXED: Added .populate() to send full details to frontend
 */
const verifyBooking = async (req, res) => {
    try {
        // Hum yahan .populate use kar rahe hain taaki alert mein 'undefined' na aaye
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('vehicle', 'brand model');

        if (!booking) {
            return res.status(404).json({ message: "Invalid QR: Booking not found" });
        }

        if (booking.status === 'Verified') {
            return res.status(400).json({ message: "Already Verified." });
        }

        booking.status = 'Verified';
        await booking.save();

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Server Error during verification" });
    }
};

/**
 * @desc    Mark booking as Completed and release vehicle (Return Phase)
 * @route   PUT /api/bookings/complete/:id
 */
const completeBooking = async (req, res) => {
    try {
        // 1. Find the booking
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 2. Prevent multiple completions
        if (booking.status === 'Completed') {
            return res.status(400).json({ message: "Ride already marked as completed." });
        }

        // 3. Mark Booking as Completed
        booking.status = 'Completed';
        await booking.save();

        // 4. Release Vehicle atomically
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            booking.vehicle, 
            {
                availabilityStatus: 'Available',
                availableFrom: Date.now()
            },
            { new: true }
        );

        if (updatedVehicle) {
            console.log(`✅ Success: ${updatedVehicle.brand} is now Available`);
        }

        res.status(200).json({ 
            message: "Ride Completed! Vehicle is now back in inventory.",
            vehicleStatus: updatedVehicle ? updatedVehicle.availabilityStatus : 'Unknown'
        });
    } catch (error) {
        console.error("Complete Booking Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createBooking, 
    getUserBookings, 
    getAllBookings, 
    verifyBooking,
    completeBooking 
};