const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

mongoose.connect('mongodb://localhost:27017/cyntax_db')
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- VISITOR SCHEMA (New Add-on) ---
const visitorSchema = new mongoose.Schema({
  count: { type: Number, default: 12345 } // Aapka starting number
});
const Visitor = mongoose.model('Visitor', visitorSchema);

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  dob: { type: Date, required: true },
  aadhaarNumber: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  course: String,
  courseDuration: String,
  joiningDate: { type: Date, default: Date.now },
  photo: String, 
  status: { type: String, default: 'Active' }
});

const Student = mongoose.model('Student', studentSchema, 'students');

// --- VISITOR API ROUTE (New Add-on) ---
app.get('/api/visitors/hit', async (req, res) => {
  try {
    let visitorData = await Visitor.findOne();
    if (!visitorData) {
      visitorData = new Visitor({ count: 12345 });
    } else {
      visitorData.count += 1; // Har hit pe +1
    }
    await visitorData.save();
    res.json({ count: visitorData.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTES ---

// Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalCount = await Student.countDocuments();
    const uniqueCourses = await Student.distinct('course');
    const latestEntries = await Student.find().sort({ joiningDate: -1 }).limit(5);
    res.json({
      totalAdmissions: totalCount,
      totalCourses: uniqueCourses.length,
      recentAdmissions: latestEntries
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const data = await Student.find().sort({ joiningDate: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    res.status(500).json({ error: err.message });
  }
});

// ✅ 1. UPDATE STUDENT
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json({ message: "Data update ho gaya!", data: updatedStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. DELETE STUDENT Route
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student record deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));