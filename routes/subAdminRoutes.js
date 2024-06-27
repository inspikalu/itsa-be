const express = require("express");
const router = express.Router();
const {
  login,
  createStaff,
  validateDeleteStaff,
  getAllStaff,
  removeStaff,
  editStaffAccount,
  addNewDevice,
  validateEmail,
  editRequest,
  assignDeviceToStaff,
  getAllRequests,
  getUnAssignedDevices,
  downloadDriver
} = require("../controllers/subAdminController");
const { verifyToken } = require("../middleware/auth");
const { check } = require("express-validator");

// Define your routes here
router.post("/login", validateEmail, login);
router.post("/create", verifyToken, validateEmail, createStaff);
// router.post('/create', createStaff);
router.get("/all", verifyToken, getAllStaff);
router.get("/requests", verifyToken, getAllRequests)
router.get("/device/unassigned", verifyToken, getUnAssignedDevices)
router.delete("/:email", verifyToken, validateDeleteStaff, removeStaff);
router.put("/edit/:email", verifyToken, [], editStaffAccount);
// router.put('/edit/:id', verifyToken, [], editStaffAccount);
router.post("/add", verifyToken, addNewDevice);
router.put("/request/:requestId", verifyToken, editRequest);
router.put("/assign-device", verifyToken, assignDeviceToStaff);
router.get('/donwload-driver', downloadDriver)

module.exports = router;

// { createStaff, validateDeleteStaff, getAllStaff, removeStaff, editStaffAccount, addNewDevice }
