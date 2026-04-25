const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Health Check
app.get('/', (req, res) => {
  res.send("🚀 Cyntax Backend is Live and Running!");
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://admin:Mohit12345@ac-vwea0ti-shard-00-00.nz7abad.mongodb.net:27017,ac-vwea0ti-shard-00-01.nz7abad.mongodb.net:27017,ac-vwea0ti-shard-00-02.nz7abad.mongodb.net:27017/?ssl=true&replicaSet=atlas-9qswbz-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.log("❌ MongoDB Connection Error:");
    console.error(err.message);
  });

// --- SCHEMAS ---
const visitorSchema = new mongoose.Schema({ count: { type: Number, default: 1000 } });
const Visitor = mongoose.model('Visitor', visitorSchema);

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

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  course: { type: String },
  message: { type: String },
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema, 'contacts');

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

// Get All Contact Messages (Dashboard ke liye)
app.get('/api/contact/all', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalAdmissions = await Student.countDocuments();
    const totalMessages = await Contact.countDocuments();
    res.json({
      totalAdmissions,
      totalMessages
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Student Management Routes (No Changes here)
app.get('/api/students', async (req, res) => {
  try {
    const data = await Student.find().sort({ joiningDate: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "Student added successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));