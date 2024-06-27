const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const { validationResult, check } = require("express-validator");
const crypto = require("crypto");
const Admin = require('../models/Admin')
const Organization = require("../models/Organization");
const SubAdmin = require("../models/SubAdmin");
const transporter = require("../config/email");

exports.validateEmail = [
  check("email").isEmail().withMessage("Please provide a valid email address"),
];




exports.createOrganization = async (req, res) => {
  try {
    const {
      companyName,
      contactPersonName,
      email,
      location,
      phoneNumber,
      password,
    } = req.body;

    // Check if the organization or sub-admin email already exists
    const existingOrg = await Organization.findOne({ email });
    const existingSubAdmin = await SubAdmin.findOne({
      email: email,
    });

    if (existingOrg || existingSubAdmin) {
      return res.status(400).json({
        message: "Organization or SubAdmin with this email already exists.",
      });
    }

    // Hash the organization password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new organization
    const newOrganization = new Organization({
      name: companyName,
      address: location,
      contactPersonName,
      contactEmail: email,
      contactPhoneNumber: phoneNumber,
      password: hashedPassword,
    });

    // Save the organization to the database
    await newOrganization.save();

    // Generate a random password for the sub-admin
    const subAdminPassword = crypto.randomBytes(8).toString("hex");
    console.log(subAdminPassword);
    // const hashedSubAdminPassword = await bcrypt.hash(subAdminPassword, 10);
    const hashedSubAdminPassword = await bcrypt.hash(password, 10);

    // Create a new sub-admin
    const newSubAdmin = new SubAdmin({
      name: contactPersonName,
      email,
      phoneNumber: phoneNumber,
      password: hashedSubAdminPassword,
      organization: newOrganization._id,
    });

    // Save the sub-admin to the database
    await newSubAdmin.save();

    // Send an email to the sub-admin with the generated password
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: contactPersonEmail,
    //   subject: "Your SubAdmin Account Password",
    //   text: `Welcome to ITSA. Your temporary password is: ${subAdminPassword}`,
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("Error sending email:", error);
    //     return res
    //       .status(500)
    //       .json({ message: "Failed to send email to SubAdmin." });
    //   }
    //   console.log("Email sent:", info.response);
    //   res
    //     .status(201)
    //     .json({ message: "Organization and SubAdmin created successfully." });
    // });

    res.status(200).json({message:'Organization Created Successfull'})
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ message: "Server error." });
  }
};

