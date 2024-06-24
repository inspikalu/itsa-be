const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

router.post('/create', organizationController.createOrganization);

module.exports = router;

