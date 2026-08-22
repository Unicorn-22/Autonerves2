const express = require('express');
const router = express.Router();
const showroomController = require('../controllers/showroomController');
const auth = require('../middleware/auth');

// Get all showrooms
router.get('/', showroomController.getAllShowrooms);

// Get nearby showrooms
router.get('/nearby', showroomController.getNearbyShowrooms);

// Get showroom by ID
router.get('/:id', showroomController.getShowroomById);

// Get all vehicles for a showroom
router.get('/:id/vehicles', showroomController.getShowroomVehicles);

// Create new showroom (dealer only)
router.post('/', auth, showroomController.createShowroom);

// Update showroom (dealer only)
router.put('/:id', auth, showroomController.updateShowroom);

// Delete showroom (dealer only)
router.delete('/:id', auth, showroomController.deleteShowroom);
// server/routes/showroomRoutes.js

// Add this route to your existing showroomRoutes.js file
// router.get('/:id/vehicles', showroomController.getShowroomVehicles);


module.exports = router;
