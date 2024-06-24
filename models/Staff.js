const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
    firstLogin: { type: Boolean, default: true }
    // other fields...
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;

