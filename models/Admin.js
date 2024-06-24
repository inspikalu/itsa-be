const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['super admin', 'sub admin'], required: true },
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;

