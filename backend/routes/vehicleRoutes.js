const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const path = require('path');
// Import all necessary controller functions
const { 
    addVehicle, 
    getVehicles, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle 
} = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * --- Multer Configuration ---
 * Temporary local storage setup
 */
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// @desc    Get all vehicles OR Add a new vehicle (Admin Only)
// @route   GET & POST /api/vehicles
router.route('/')
    .get(getVehicles)
    .post(protect, admin, upload.single('image'), addVehicle);

// @desc    Get, Update, or Delete a specific vehicle
// @route   GET, PUT, DELETE /api/vehicles/:id
router.route('/:id')
    .get(getVehicleById)
    .put(protect, admin, upload.single('image'), updateVehicle) // Admin can update details/image
    .delete(protect, admin, deleteVehicle); // Admin can remove vehicle

module.exports = router;