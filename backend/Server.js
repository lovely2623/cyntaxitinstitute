const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// --- SPAM PROTECTION ---
const contactLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Spam Alert! Please try again tomorrow." }
});

const visitorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 1, 
  keyGenerator: (req) => req.ip, 
  handler: async (req, res) => {
    const data = await mongoose.model('Visitor').findOne({});
    res.json({ count: data ? data.count : 1000 });
  },
  skipFailedRequests: true
});

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://admin:Mohit12345@ac-vwea0ti-shard-00-00.nz7abad.mongodb.net:27017,ac-vwea0ti-shard-00-01.nz7abad.mongodb.net:27017,ac-vwea0ti-shard-00-02.nz7abad.mongodb.net:27017/?ssl=true&replicaSet=atlas-9qswbz-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// --- SCHEMAS ---
const visitorSchema = new mongoose.Schema({ count: { type: Number, default: 1000 } });
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
  status: { type: String, default: 'Active' },
  // EXAM & RESULT FIELDS (strict storage)
  hasGivenTest: { type: Boolean, default: false },
  testScore: { type: Number, default: 0 },
  testGrade: { type: String, default: null },
  testDate: { type: String, default: null },
  submittedExamPaper: { type: Object, default: null },
  paperSnapshot: { type: Object, default: null },
  examPaperData: { type: String, default: null },
  details: { type: Object, default: {} },
  // CERTIFICATE FIELDS
  isCertificateIssued: { type: Boolean, default: false },
  certificateDetails: { type: Object, default: null }
}, { strict: false });
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

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Pdf = mongoose.model('Pdf', pdfSchema);

const newsSchema = new mongoose.Schema({
  tag: { type: String, default: 'NEW' },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const News = mongoose.model('News', newsSchema);

// NEW: QUESTION SCHEMA & MODEL
const questionSchema = new mongoose.Schema({
  id: { type: Number },
  q: { type: String, required: true },
  o: [{ type: String, required: true }],
  a: { type: Number, required: true },
  course: { type: String, required: true, uppercase: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema, 'questions');

// --- ROUTES ---

// QUESTION MANAGEMENT ROUTES
app.get('/api/questions', async (req, res) => {
  try {
    const { course } = req.query;
    let filter = {};
    if (course) {
      filter.course = { $regex: new RegExp(`^${course.trim()}$`, 'i') };
    }
    const questions = await Question.find(filter).sort({ createdAt: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { q, o, a, course, id } = req.body;
    if (!q || !o || a === undefined || !course) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newQ = new Question({
      id: id || Date.now(),
      q: q.trim(),
      o: Array.isArray(o) ? o.map(item => item.trim()) : [],
      a: Number(a),
      course: course.trim().toUpperCase()
    });
    const saved = await newQ.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    await Question.deleteMany({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(targetId) ? targetId : null },
        { id: Number(targetId) }
      ]
    });
    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalAdmissions = await Student.countDocuments();
    const totalMessages = await Contact.countDocuments();
    res.json({ totalAdmissions, totalMessages });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contact/all', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/contact/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfs = await Pdf.find().sort({ date: -1 });
    res.json(pdfs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pdfs', async (req, res) => {
  try {
    const newPdf = new Pdf(req.body);
    await newPdf.save();
    res.status(201).json(newPdf);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    await Pdf.findByIdAndDelete(req.params.id);
    res.json({ message: "PDF Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/news', async (req, res) => {
  try {
    const newNews = new News(req.body);
    await newNews.save();
    res.status(201).json(newNews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/students/verify/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id.toUpperCase() });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/visitors/hit', visitorLimiter, async (req, res) => {
  try {
    let visitorData = await Visitor.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true, new: true });
    res.json({ count: visitorData.count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const newMessage = new Contact(req.body);
    await newMessage.save();
    res.status(201).json({ success: true, message: "Sent!" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/students', async (req, res) => {
  try {
    const data = await Student.find().sort({ joiningDate: -1 });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Single student fetch by ID or StudentId
app.get('/api/students/:id', async (req, res) => {
  try {
    const target = req.params.id;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(target)) {
      query = { $or: [{ _id: target }, { studentId: target.toUpperCase() }] };
    } else {
      query = { studentId: target.toUpperCase() };
    }
    const student = await Student.findOne(query);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "Success" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update Student
app.put('/api/students/:id', async (req, res) => {
  try {
    const target = req.params.id;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(target)) {
      query = { _id: target };
    } else {
      query = { studentId: target.toUpperCase() };
    }
    const updated = await Student.findOneAndUpdate(query, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// NEW: Issue Certificate Route
app.put('/api/students/issue-certificate/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id, 
      { 
        $set: {
          isCertificateIssued: true, 
          certificateDetails: req.body.certificateDetails 
        }
      }, 
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));