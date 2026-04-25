const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Health Check Route
app.get('/', (req, res) => {
  res.send("🚀 Cyntax Backend is Live and Running!");
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/cyntax_db';

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- VISITOR SCHEMA ---
const visitorSchema = new mongoose.Schema({
  count: { type: Number, default: 1000 }
});
const Visitor = mongoose.model('Visitor', visitorSchema);

// --- STUDENT SCHEMA ---
const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  dob: { type: Date, required: true },
  aadhaarNumber: { type: String, required: true }, // [Aadhaar Redacted]
  phone: { type: String, required: true },
  address: String,
  course: String,
  courseDuration: String,
  joiningDate: { type: Date, default: Date.now },
  photo: String, 
  status: { type: String, default: 'Active' }
});
const Student = mongoose.model('Student', studentSchema, 'students');

// --- CONTACT MESSAGE SCHEMA (Naya Section) ---
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  course: { type: String },
  message: { type: String },
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// --- ROUTES ---

// Submit Contact Form
app.post('/api/contact', async (req, res) => {
  try {
    const newMessage = new Contact(req.body);
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Visitor Hit
app.get('/api/visitors/hit', async (req, res) => {
  try {
    let visitorData = await Visitor.findOne();
    if (!visitorData) {
      visitorData = new Visitor({ count: 1000 });
    } else {
      visitorData.count += 1;
    }
    await visitorData.save();
    res.json({ count: visitorData.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalCount = await Student.countDocuments();
    const totalMessages = await Contact.countDocuments(); // Naya stat
    const uniqueCourses = await Student.distinct('course');
    const latestEntries = await Student.find().sort({ joiningDate: -1 }).limit(5);
    res.json({
      totalAdmissions: totalCount,
      totalMessages: totalMessages,
      totalCourses: uniqueCourses.length,
      recentAdmissions: latestEntries
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const data = await Student.find().sort({ joiningDate: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Post Student
app.post('/api/students', async (req, res) => {
  try {
    const studentData = req.body;
    if(!studentData.joiningDate) studentData.joiningDate = new Date();
    const newStudent = new Student(studentData);
    await newStudent.save();
    res.status(201).json({ message: "Student added successfully!" });
  } catch (err) { 
    console.error("Save Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

// Update Student
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Data update ho gaya!", data: updatedStudent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete Student
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student record deleted!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));