const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const Organization = require("../models/Organization");

exports.validateEmail = [
  check("email").isEmail().withMessage("Please provide a valid email address"),
];

exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res
        .status(400)
        .json({ message: "Admin with this email already exists." });
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new organization
    const newAdmin = new Admin({
      name: "ITSA",
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res
      .status(200)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    const adminData = Admin.findOne({ email });

    if (!adminData)
      return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = bcrypt.compare(password, adminData.password);

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: adminData._id, email: adminData.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeOrganization = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin")
      return res.status(403).json({ message: "Unauthorized to edit request." });

    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }
    const organizationData = await Organization.findById(id);
    console.log(organizationData);

    if (!organizationData) {
      return res.status(404).json({ message: "Orgnaization not found" });
    }

    const deletedOrg = await Organization.findByIdAndDelete(id);

    res.status(200).json({
      message: "Organization deleted successfully",
      deletedOrganization: deletedOrg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Object containing updated fields
    
    const { role } = req.user;
    if (role !== "admin")
      return res
        .status(403)
        .json({ message: "Unauthorized to edit organization." });

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }

    // Perform update using findByIdAndUpdate
    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({
      message: "Organization updated successfully",
      updatedOrganization,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    const total = organizations.length;

    res.status(200).json({
      message: "Organizations retrieved successfully",
      total,
      organizations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

