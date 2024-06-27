const express = require('express');
const router = express.Router();
const { validateEmail, createAdmin, removeOrganization, login, editOrganization, getAllOrganizations} = require('../controllers/adminController');
const {verifyToken} = require("../middleware/auth")

// Define your routes here
router.get('/organizations',getAllOrganizations )
router.post('/admin', validateEmail, createAdmin)
router.post('/login',validateEmail, login)
router.delete('/delete/:id',verifyToken, removeOrganization )
router.put('/edit/:id',verifyToken, editOrganization )

module.exports = router;
