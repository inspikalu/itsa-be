const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactPersonName: { type: String, required: true },
  contactEmail: { type: String, required: true, unique: true },
  contactPhoneNumber: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Organization", OrganizationSchema);
