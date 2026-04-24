const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    rollNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String },
    course: { type: String },
    totalFees: { type: Number },
    paidFees: { type: Number },
    joiningDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);