const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    // other fields...
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;


