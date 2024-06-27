const express = require('express');
const router = express.Router();
const { verifyEmail, createAdmin, createOrganization} = require('../controllers/organizationController');
const {verifyToken} = require("../middleware/auth")


router.post('/create', createOrganization);

// router.delete('/delete/:id', removeOrganization )

module.exports = router;

