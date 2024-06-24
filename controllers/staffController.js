const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const crypto = require("crypto");
const Organization = require("../models/Organization");
const Staff = require("../models/Staff");
const Request = require('../models/Request')
const transporter = require("../config/email");
const { v4: uuidv4 } = require('uuid');

exports.validateEmail = [
  check("email").isEmail().withMessage("Please provide a valid email address"),
];

exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });
    console.log(staff)
    if (!staff)
      return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: staff._id, email: staff.email, role: "staff" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const message = staff.firstLogin
      ? {
          message: "Login successful",
          token,
          organizationId: staff.organizationId,
          staffId:staff._id,
          firstLogin: true,
        }
      : {
          message: "Login successful",
          token,
          organizationId: staff.organizationId,
          staffId:staff._id,
        };

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.newRequest = async (req, res) => {
    try {
      const requestId = uuidv4();
      console.log(requestId)
      const { type, description, priority, requester, organization, ...otherData } = req.body;
  
      // Validate required fields (optional, enhance security)
      if (!type || !description || !requester || !organization) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check for duplicate requests
    const existingRequest = await Request.findOne({ requestId });
    console.log(requestId === existingRequest, "Check request id")
    console.log(existingRequest, "This is existingRequest")
    if (existingRequest) {
      return res.status(409).json({ message: "Request already submitted" });
    }
  
      const newRequest = new Request({
        requestId,
        type,
        description,
        priority,
        requester,
        organization,
        ...otherData, // capture any additional data sent
      });
  
      await newRequest.save(); // Save the new request to the database
  
      res.status(201).json({ message: "Request created successfully", request: newRequest });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  