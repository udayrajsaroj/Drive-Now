const Vehicle = require('../models/Vehicle');
const cloudinary = require('cloudinary').v2;

/**
 * --- Cloudinary Configuration ---
 * Environment variables se keys load ho rahi hain.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Add a new vehicle with Image Upload
// @route   POST /api/vehicles
// @access  Private/Admin
const addVehicle = async (req, res) => {
  try {
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'drive-now-fleet',
        use_filename: true,
      });
      imageUrl = result.secure_url;
    } else {
      return res.status(400).json({ message: 'Please upload a vehicle image' });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      imageUrl: imageUrl,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Upload Error Details:", error);
    res.status(400).json({ message: error.message || "Failed to upload image" });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      res.status(200).json(vehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vehicle details or image
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      let imageUrl = vehicle.imageUrl;

      // Agar admin ne naya image select kiya hai
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'drive-now-fleet',
        });
        imageUrl = result.secure_url;
      }

      // Fields update karein
      vehicle.brand = req.body.brand || vehicle.brand;
      vehicle.model = req.body.model || vehicle.model;
      vehicle.vehicleType = req.body.vehicleType || vehicle.vehicleType;
      vehicle.rentPerDay = req.body.rentPerDay || vehicle.rentPerDay;
      vehicle.fuelType = req.body.fuelType || vehicle.fuelType;
      vehicle.transmission = req.body.transmission || vehicle.transmission;
      vehicle.availabilityStatus = req.body.availabilityStatus || vehicle.availabilityStatus;
      vehicle.imageUrl = imageUrl;

      const updatedVehicle = await vehicle.save();
      res.json(updatedVehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      await vehicle.deleteOne();
      res.json({ message: 'Vehicle removed from fleet' });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
    addVehicle, 
    getVehicles, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle 
};