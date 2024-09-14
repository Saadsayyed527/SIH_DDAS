const express = require('express');
const { registerUser } = require('../controllers/userController');
const router = express.Router();

// Register user route
router.post('/register', registerUser);

module.exports = router;
