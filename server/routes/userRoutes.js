const express = require('express');
const router = express.Router();
const { authUser, registerUser, setPassword } = require('../controllers/authController');

router.post('/', registerUser);
router.post('/login', authUser);
router.put('/setpassword/:resetToken', setPassword);

module.exports = router;
