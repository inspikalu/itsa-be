const express = require('express');
const router = express.Router();
const {staffLogin, validateEmail, newRequest} = require("../controllers/staffController")
const {verifyToken} = require("../middleware/auth")

// Define your routes here
router.post('/login',validateEmail ,staffLogin);
// router.post('/request',verifyToken, newRequest )
router.post('/request', newRequest )

module.exports = router;
