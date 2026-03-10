const express = require('express');
const router = express.Router();
const { authUser, registerUser, setPassword, googleLogin } = require('../controllers/authController');
const { getUsers, addAdmin, deleteUser, getUserProfile, getAdminDashboardOverview } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.get('/', protect, admin, getUsers);
router.get('/profile', protect, getUserProfile);
router.get('/admin/dashboard', protect, admin, getAdminDashboardOverview);
router.post('/admin', protect, admin, addAdmin);
router.delete('/:id', protect, admin, deleteUser);
router.post('/login', authUser);
router.post('/google-login', googleLogin);
router.put('/setpassword/:resetToken', setPassword);

module.exports = router;
