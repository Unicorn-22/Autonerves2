const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const takeLast = (value) => {
  if (Array.isArray(value)) {
    return value[value.length - 1];
  }
  return value;
};

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Search vehicles
router.get(
  '/search',
  [
    query('type').customSanitizer(takeLast).optional().isString(),
    query('brand').customSanitizer(takeLast).optional().isString(),
    query('model').customSanitizer(takeLast).optional().isString(),
    query('minPrice').customSanitizer(takeLast).optional().isNumeric(),
    query('maxPrice').customSanitizer(takeLast).optional().isNumeric(),
    query('lat').customSanitizer(takeLast).optional().isNumeric(),
    query('lng').customSanitizer(takeLast).optional().isNumeric(),
    query('radius').customSanitizer(takeLast).optional().isNumeric(),
    query('query').customSanitizer(takeLast).optional().isString(),
  ],
  vehicleController.searchVehicles
);

// Get unique brands for a vehicle type
router.get(
  '/brands',
  [query('type').customSanitizer(takeLast).optional().isString()],
  vehicleController.getBrands
);

// Get unique models for a brand
router.get(
  '/models',
  [
    query('type').customSanitizer(takeLast).optional().isString(),
    query('brand').customSanitizer(takeLast).optional().isString()
  ],
  vehicleController.getModels
);

// Get vehicle by ID
router.get('/:id', vehicleController.getVehicleById);

// Create new vehicle (dealer only)
router.post('/', auth, vehicleController.createVehicle);

// Upload images for a vehicle
router.post('/:id/images', upload, vehicleController.uploadVehicleImages);


// Update vehicle (dealer only)
router.put('/:id', auth, vehicleController.updateVehicle);

// Delete vehicle (dealer only)
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;
