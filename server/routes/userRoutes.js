const express = require('express');
const router = express.Router();
const { authUser, registerUser, setPassword } = require('../controllers/authController');
const { getUsers, addAdmin, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.get('/', protect, admin, getUsers);
router.post('/admin', protect, admin, addAdmin);
router.delete('/:id', protect, admin, deleteUser);
router.post('/login', authUser);
router.put('/setpassword/:resetToken', setPassword);

module.exports = router;
