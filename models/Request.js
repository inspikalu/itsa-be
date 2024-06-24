const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    requestId: {type: String, required:true},
    timeRequested: { type: Date, default: Date.now, },
    type: { type: String, enum: ['repair', 'maintenance'], required: true, },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    status: { type: String, enum: ['pending', 'in-progess', 'completed'], default: 'pending' },
    requester: {type:mongoose.Schema.Types.ObjectId,ref: "Staff", required: true},
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, },
    resolutionDetails: { type: String, },
    location: { type: String, },
    isUrgent: { type: Boolean, default: false,},
});

const Request = mongoose.model('MaintenanceRequest', requestSchema);
module.exports = Request;

