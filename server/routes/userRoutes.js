// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, userController.getAllUsers);

// Get user by ID
router.get('/:id', auth, userController.getUserById);

// Update user profile
router.put(
  '/profile',
  auth,
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').optional(),
    body('email').optional().isEmail().withMessage('Please include a valid email')
  ],
  userController.updateProfile
);

// Update password
router.put(
  '/password',
  auth,
  [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  userController.updatePassword
);

// Delete user (self or admin)
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
