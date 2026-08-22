const Showroom = require('../models/Showroom');
const Vehicle = require('../models/Vehicle');

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

// Get all showrooms with pagination
exports.getAllShowrooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const showrooms = await Showroom.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Showroom.countDocuments();
    
    res.json({
      showrooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getAllShowrooms:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get showroom by ID
exports.getShowroomById = async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id)
      .populate('owner', 'name email');
    
    if (!showroom) {
      return res.status(404).json({ message: 'Showroom not found' });
    }
    
    // Get vehicle count
    const vehicleCount = await Vehicle.countDocuments({ showroom: showroom._id });
    
    // Get popular brands in this showroom
    const brandsAggregate = await Vehicle.aggregate([
      { $match: { showroom: showroom._id } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const popularBrands = brandsAggregate.map(item => item._id);
    
    // Combine showroom data with additional information
    const showroomData = {
      ...showroom.toObject(),
      vehicleCount,
      popularBrands
    };
    
    res.json(showroomData);
  } catch (error) {
    console.error('Error in getShowroomById:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all vehicles for a showroom
exports.getShowroomVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find({ showroom: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vehicle.countDocuments({ showroom: req.params.id });

    res.json({
      vehicles,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getShowroomVehicles:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get nearby showrooms
exports.getNearbyShowrooms = async (req, res) => {
  try {
    const { lat, lng, distance = 25, vehicleType, brand } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }

    let query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(distance) * 1000 // Convert km to meters
        }
      }
    };

    if (vehicleType && vehicleType !== 'all') {
      query.vehicleTypes = vehicleType;
    }

    if (brand) {
      const vehicles = await Vehicle.find({ brand: { $regex: brand, $options: 'i' } }).distinct('showroom');
      query._id = { $in: vehicles };
    }

    const showrooms = await Showroom.find(query);

    res.set('Cache-Control', 'no-store');
    res.json(showrooms);
  } catch (error) {
    console.error('Error in getNearbyShowrooms:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new showroom
exports.createShowroom = async (req, res) => {
  try {
    // Check if user is a dealer
    if (req.user.role !== 'dealer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create showrooms' });
    }
    
    // Create new showroom
    const newShowroom = new Showroom({
      ...req.body,
      owner: req.user.id
    });
    
    await newShowroom.save();
    
    res.status(201).json(newShowroom);
  } catch (error) {
    console.error('Error in createShowroom:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update showroom
exports.updateShowroom = async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id);
    
    if (!showroom) {
      return res.status(404).json({ message: 'Showroom not found' });
    }
    
    // Check if user is authorized to update
    if (showroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this showroom' });
    }
    
    // Update showroom
    const updatedShowroom = await Showroom.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedShowroom);
  } catch (error) {
    console.error('Error in updateShowroom:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete showroom
exports.deleteShowroom = async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id);
    
    if (!showroom) {
      return res.status(404).json({ message: 'Showroom not found' });
    }
    
    // Check if user is authorized to delete
    if (showroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this showroom' });
    }
    
    // Delete all vehicles associated with this showroom
    await Vehicle.deleteMany({ showroom: showroom._id });
    
    // Delete the showroom
    await Showroom.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Showroom and all associated vehicles removed' });
  } catch (error) {
    console.error('Error in deleteShowroom:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};