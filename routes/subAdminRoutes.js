const express = require('express');
const router = express.Router();
const { login, createStaff, validateDeleteStaff, getAllStaff, removeStaff, editStaffAccount, addNewDevice,validateEmail } = require("../controllers/subAdminController")
const  { verifyToken } = require("../middleware/auth");
const { check } = require('express-validator');

// Define your routes here
router.post('/login',validateEmail,login)
router.post('/create', verifyToken, validateEmail, createStaff);
// router.post('/create', createStaff);
router.get('/all', verifyToken, getAllStaff);
router.delete('/:email', verifyToken, validateDeleteStaff, removeStaff);
router.put('/edit/:email', verifyToken, [], editStaffAccount);
router.post('/add', verifyToken, addNewDevice);

module.exports = router;


// { createStaff, validateDeleteStaff, getAllStaff, removeStaff, editStaffAccount, addNewDevice } 