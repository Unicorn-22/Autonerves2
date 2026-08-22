const { validationResult } = require('express-validator');
const axios = require('axios');
const Vehicle = require('../models/Vehicle');
const Showroom = require('../models/Showroom');

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Get all vehicles with pagination
exports.getAllVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const vehicles = await Vehicle.find()
      .populate('showroom', 'name address location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Vehicle.countDocuments();
    
    res.json({
      vehicles,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getAllVehicles:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('showroom');
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Error in getVehicleById:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchVehicles = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (Object.keys(req.query).length === 0) {
      return exports.getAllVehicles(req, res);
    }

    const {
      type,
      brand,
      model,
      minPrice,
      maxPrice,
      lat,
      lng,
      radius = 50, // Default 50km radius
      query
    } = req.query;

    
    // Build search filter
    const filter = {};
    
    if (type && type !== 'all') filter.type = type;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (model) filter.model = { $regex: model, $options: 'i' };
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
      if (Object.keys(filter.price).length === 0) {
        delete filter.price;
      }
    }
    
    // Full-text search
    if (query) {
      filter.$or = [
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    let vehicles;
    
    // Location based search
    if (lat && lng && radius) {
      // Find showrooms within the radius
      const showrooms = await Showroom.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      }).select('_id');
      
      const showroomIds = showrooms.map(s => s._id);
      
      // Add showroom filter
      filter.showroom = { $in: showroomIds };
      
      // Get vehicles with showroom data
      vehicles = await Vehicle.find(filter)
        .populate({
          path: 'showroom',
          select: 'name address location phone email'
        })
        .limit(50);
      
      // Calculate distance for each vehicle and filter
      const vehiclesWithDistance = [];
      for (const vehicle of vehicles) {
        const vehicleObj = vehicle.toObject();
        const showroomLocation = vehicle.showroom.location.coordinates;
        
        // Calculate distance using Haversine formula
        const userLocation = [parseFloat(lng), parseFloat(lat)];
        const distanceInKm = calculateDistance(
          userLocation[1], userLocation[0],
          showroomLocation[1], showroomLocation[0]
        );
        
        if (distanceInKm <= radius) {
          vehicleObj.distance = distanceInKm;
          vehiclesWithDistance.push(vehicleObj);
        }
      }
      
      // Sort by distance
      vehiclesWithDistance.sort((a, b) => a.distance - b.distance);
      vehicles = vehiclesWithDistance;
    } else {
      // Regular search without location
      vehicles = await Vehicle.find(filter)
        .populate('showroom', 'name address phone email')
        .sort({ createdAt: -1 })
        .limit(50);
    }
    
    res.set('Cache-Control', 'no-store');
    res.json(vehicles);
  } catch (error) {
    console.error('Error in searchVehicles:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unique brands for a vehicle type
exports.getBrands = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type } = req.query;

    if (type === 'car') {
      try {
        const response = await axios.get('https://carapi.app/api/makes');
        const brands = response.data.data.map(make => make.name);
        return res.json(brands.sort());
      } catch (error) {
        console.error('Error fetching car brands from carapi.app:', error.message);
        return res.status(502).json({ message: 'Error fetching car brands from external API.' });
      }
    } else if (type === 'bike') {
      try {
        const response = await axios.get('https://www.carqueryapi.com/api/0.3/?cmd=getMakes&type=motorcycle');
        const brands = response.data.Makes.map(make => make.make_display);
        return res.json(brands.sort());
      } catch (error) {
        console.error('Error fetching bike brands from carqueryapi.com:', error.message);
        return res.status(502).json({ message: 'Error fetching bike brands from external API.' });
      }
    }

    const filter = type && type !== 'all' ? { type } : {};
    const brands = await Vehicle.distinct('brand', filter);
    res.json(brands.sort());
  } catch (error) {
    console.error('Error in getBrands:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unique models for a brand
exports.getModels = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, brand } = req.query;

    if (type === 'car' && brand) {
      try {
        const response = await axios.get(`https://carapi.app/api/models?make=${brand}`);
        const models = response.data.data.map(model => model.name);
        return res.json(models.sort());
      } catch (error) {
        console.error('Error fetching car models from carapi.app:', error.message);
        return res.status(502).json({ message: 'Error fetching car models from external API.' });
      }
    } else if (type === 'bike' && brand) {
      try {
        const response = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${brand}`);
        const models = response.data.Models.map(model => model.model_name);
        return res.json(models.sort());
      } catch (error) {
        console.error('Error fetching bike models from carqueryapi.com:', error.message);
        return res.status(502).json({ message: 'Error fetching bike models from external API.' });
      }
    }

    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (brand) filter.brand = brand;
    
    const models = await Vehicle.distinct('model', filter);
    res.json(models.sort());
  } catch (error) {
    console.error('Error in getModels:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    // Check if user is a dealer
    if (req.user.role !== 'dealer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add vehicles' });
    }
    
    // Check if the showroom belongs to the dealer
    const showroom = await Showroom.findById(req.body.showroom);
    
    if (!showroom) {
      return res.status(404).json({ message: 'Showroom not found' });
    }
    
    if (showroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add vehicles to this showroom' });
    }
    
    // Create new vehicle
    const newVehicle = new Vehicle({
      ...req.body
    });
    
    await newVehicle.save();
    
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error in createVehicle:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Get showroom to check ownership
    const showroom = await Showroom.findById(vehicle.showroom);
    
    if (!showroom) {
      return res.status(404).json({ message: 'Showroom not found' });
    }
    
    // Check if user is authorized to update
    if (showroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }
    
    // Update vehicle
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('showroom');
    
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error in updateVehicle:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Get showroom to check ownership
    const showroom = await Showroom.findById(vehicle.showroom);
    
    if (!showroom) {
      return res.status(404).json({ message: 'Showroom not found' });
    }
    
    // Check if user is authorized to delete
    if (showroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }
    
    await Vehicle.findByIdAndRemove(req.params.id);

    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload images for a vehicle
exports.uploadVehicleImages = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership (similar to update/delete logic)
    const showroom = await Showroom.findById(vehicle.showroom);
    if (showroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add images to this vehicle' });
    }

    if (req.files) {
      const imagePaths = req.files.map(file => `/uploads/vehicles/${file.filename}`);
      
      vehicle.images = vehicle.images.concat(imagePaths);
      await vehicle.save();

      res.json(vehicle);
    } else {
      res.status(400).json({ message: 'No images uploaded' });
    }
  } catch (error) {
    console.error('Error in uploadVehicleImages:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

