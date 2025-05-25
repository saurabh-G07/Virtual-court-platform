const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user profile
router.put('/profile', uploadMiddleware.single('profileImage'), userController.updateProfile);

// Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;
