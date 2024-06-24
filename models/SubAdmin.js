const mongoose = require('mongoose');

const SubAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    
});

module.exports = mongoose.model('SubAdmin', SubAdminSchema);

