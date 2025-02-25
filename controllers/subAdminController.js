const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const transporter = require("../config/email");
const crypto = require("crypto");
const SubAdmin = require("../models/SubAdmin");
const Staff = require("../models/Staff");
const Device = require("../models/Device");
const Request = require("../models/Request");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const subAdminData = await SubAdmin.findOne({ email });

    if (!subAdminData) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      subAdminData.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: subAdminData._id, email: subAdminData.email, role: "sub-admin" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      organizationId: subAdminData.organization,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
  } catch (error) {}
};

exports.validateEmail = [
  check("email").isEmail().withMessage("Please provide a valid email address"),
];

exports.createStaff = async (req, res) => {
  try {
    const { name, email, organizationId } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if staff with the same email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res
        .status(400)
        .json({ message: "Staff with this email already exists." });
    }

    // Verify user role from token
    const { role } = req.user;

    // Only allow admin and sub-admin to create staff
    if (role !== "admin" && role !== "sub-admin") {
      return res.status(403).json({ message: "Unauthorized to create staff." });
    }

    const staffPassword = crypto.randomBytes(3).toString("hex");
    const hashedStaffPassword = await bcrypt.hash(staffPassword, 10);

    // Create new staff member
    const newStaff = new Staff({
      name,
      email,
      password: hashedStaffPassword,
      organizationId,
      devices: [], // Initialize with an empty array of devices
    });

    // Send the password to the user
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Staff Account Password",
      text: `Welcome to ITSA. Your temporary password is: ${staffPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Failed to send email to SubAdmin." });
      }
      console.log("Email sent:", info.response);
      res
        .status(201)
        .json({ message: "Organization and SubAdmin created successfully." });
    });

    // Save staff member to the database
    await newStaff.save();

    res
      .status(201)
      .json({ message: "Staff created successfully", staff: newStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staffs = await Staff.find();

    if (!staffs || staffs.length === 0) {
      return res.status(404).json({ message: "No staff members found." });
    }

    res.status(200).json({ message: "Staffs retrieved successfully", staffs });
  } catch (error) {
    console.error("Error fetching staffs:", error);
    res.status(500).json({ message: "Failed to retrieve staffs." });
  }
};

exports.validateDeleteStaff = [
  // Validate email parameter
  check("email").isEmail().withMessage("Please provide a valid email address."),
];

exports.removeStaff = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract validated parameters
    const { email } = req.params;
    const { role } = req.user;

    // Check if user is authorized (admin or sub-admin)
    if (role !== "admin" && role !== "sub-admin") {
      return res.status(403).json({ message: "Unauthorized to delete staff." });
    }

    // Find the staff member by email
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }

    // Delete the staff member
    const deletedStaff = await Staff.findOneAndDelete({ email });

    if (!deletedStaff) {
      return res.status(500).json({ message: "Failed to delete staff." });
    }

    res
      .status(200)
      .json({ message: "Staff deleted successfully", staff: deletedStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editStaffAccount = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, organizationId } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user role from token
    const { role } = req.user;

    // Only allow admin and sub-admin to edit staff
    if (role !== "admin" && role !== "sub-admin") {
      return res.status(403).json({ message: "Unauthorized to edit staff." });
    }

    // Find the staff member by email and update
    const updatedStaff = await Staff.findOneAndUpdate(
      { email },
      { $set: { name, organizationId } },
      { new: true } // Return the updated document
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found." });
    }

    res
      .status(200)
      .json({ message: "Staff updated successfully", staff: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addNewDevice = async (req, res) => {
  try {
    // Extract parameters from request body
    const { name, type, serialNumber } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user role from token
    const { role } = req.user;

    // Only allow admin and sub-admin to add devices
    if (role !== "admin" && role !== "sub-admin") {
      return res.status(403).json({ message: "Unauthorized to add devices." });
    }

    // Create new device instance
    const newDevice = new Device({
      name,
      type,
      serialNumber,
      // Add additional fields as needed
    });

    // Save the new device to the database
    await newDevice.save();

    res
      .status(201)
      .json({ message: "Device added successfully", device: newDevice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updateData = req.body;
    console.log(req.params);

    if (!requestId || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { role } = req.user;
    if (role !== "sub-admin" && role !== "admin")
      return res.status(403).json({ message: "Unauthorized to edit request." });

    const updatedRequest = await Request.findOneAndUpdate(
      { requestId },
      updateData,
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignDeviceToStaff = async (req, res) => {
  try {
    const { deviceId, staffId } = req.body;

    // Validate input
    if (!deviceId || !staffId) {
      return res
        .status(400)
        .json({ message: "Device ID and Staff ID are required" });
    }

    // Verify user role from token
    const { role } = req.user;
    if (role !== "admin" && role !== "sub-admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to assign device." });
    }

    // Find the device and staff
    const device = await Device.findById(deviceId);
    const staff = await Staff.findById(staffId);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Check if the device is already assigned to another staff member
    if (device.assignedTo) {
      return res.status(400).json({
        message: "Device is already assigned to another staff member",
      });
    }

    // Assign the device to the staff
    device.assignedTo = staff._id;
    await device.save();

    // Add the device to the staff's devices array
    staff.devices.push(device._id);
    await staff.save();

    res
      .status(200)
      .json({ message: "Device assigned successfully", device, staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRequests = async function (req, res) {
  try {
    const { role } = req.user;
    if (role !== "admin" && role !== "sub-admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to assign device." });
    }
    const requests = await Request.find();

    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: "No requests made." });
    }

    res
      .status(200)
      .json({ message: "Requests retrieved successfully", requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnAssignedDevices = async function (req, res) {
  try {
    const { role } = req.user;
    if (role !== "admin" && role !== "sub-admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to assign device." });
    }

    const query = { assignedTo: { $exists: false } }; // Find documents where "assignedTo" field doesn't exist

    // Device.find(query, (err, results) => {
    //   if (err) {
    //     return res
    //     .status(404)
    //     .json({ message: "No Devices are unassigned" });
    //   } else {
    //     console.log("Devices without assignedTo field:", results);
    //     ress
    //     .status(200)
    //     .json({ message: "Unassigned Devices Retrieved successfully", devices:results });
    //   }
    // });

    const unassignedDevices = await Device.find(query);
    if (!unassignedDevices) {
      return res.status(404).json({ message: "No Devices are unassigned" });
    }
    res
      .status(200)
      .json({
        message: "Unassigned Devices Retrieved successfully",
        devices: unassignedDevices,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadDriver = async function(req, res){
  const os = req.query.os;
  const token = req.headers['authorization'];
  const organizationId = req.headers['x-organization-id'];

  if (!token || !organizationId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let driverPath = '';

  switch (os) {
    case 'Windows':
      driverPath = path.join(__dirname, 'drivers', 'windows-driver.exe');
      break;
    case 'MacOS':
      driverPath = path.join(__dirname, 'drivers', 'mac-driver.pkg');
      break;
    // Add cases for other OS if needed
    default:
      return res.status(400).json({ message: 'Unsupported OS' });
  }

  res.download(driverPath, 'ITSA_Driver.exe', (err) => {
    if (err) {
      console.error('Error downloading driver:', err);
      res.status(500).json({ message: 'Error downloading driver' });
    }
  });

}
