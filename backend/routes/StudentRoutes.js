const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 1. Naya Admission Add Karna (POST)
router.post('/add', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json({ message: "Student Added Successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Saare Students ki List Dekhna (GET)
router.get('/all', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;