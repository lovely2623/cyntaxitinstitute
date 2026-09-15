import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../admin/AdminLayout.css';
import Certificate from './Certificate';

function StudentList() {
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";
  const CACHE_KEY = "cyntax_cached_students_list";

  const [students, setStudents] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [certStudent, setCertStudent] = useState(null);
  const [viewPaperStudent, setViewPaperStudent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");

  const fetchStudents = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${BASE_URL}/api/students`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Background sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const parseStudent = useCallback((s) => {
    if (!s) return {};
    const d = s.details || s.additionalDetails || {};
    const ac = s.academics || {};

    const getVal = (...keys) => {
      for (const val of keys) {
        if (val !== undefined && val !== null) {
          const str = val.toString().trim();
          if (str !== "" && str !== "N/A" && str !== "undefined" && str !== "null") {
            return str;
          }
        }
      }
      return "";
    };

    let cleanDob = "";
    const rawDob = getVal(s.dob, d.dob);
    if (rawDob) {
      cleanDob = rawDob.includes("T") ? rawDob.split("T")[0] : rawDob.replace(/\//g, "-");
      if (cleanDob.includes("-")) {
        const p = cleanDob.split("-");
        if (p.length === 3 && p[0].length !== 4 && p[2].length === 4) {
          cleanDob = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
        }
      }
    }

    let cleanAdmissionDate = "";
    const rawAdm = getVal(s.admissionDate, s.joiningDate, d.admissionDate, d.joiningDate);
    if (rawAdm) {
      cleanAdmissionDate = rawAdm.includes("T") ? rawAdm.split("T")[0] : rawAdm;
    }

    const regId = getVal(s.studentId, s.rollNo, s.regNo, d.studentId, d.rollNo, d.regNo);
    const aadhaarVal = getVal(
      s.aadhaar, s.adaharNumber, s.adharNumber, s.aadharNumber, s.aadhaarNumber, s.adahar, s.adhar, s.aadhar,
      d.aadhaar, d.adaharNumber, d.adharNumber, d.aadharNumber, d.aadhaarNumber, d.adahar, d.adhar, d.aadhar
    );

    const rawFullName = getVal(s.name, d.name);
    let parsedFirst = getVal(s.firstName, d.firstName);
    let parsedLast = getVal(s.lastName, d.lastName);

    if (!parsedFirst && rawFullName) {
      const parts = rawFullName.split(" ");
      parsedFirst = parts[0] || "";
      parsedLast = parts.slice(1).join(" ") || "";
    }

    return {
      ...s,
      _id: s._id,
      studentId: regId,
      name: rawFullName,
      firstName: parsedFirst,
      lastName: parsedLast,
      gender: getVal(s.gender, d.gender) || "Male",
      dob: cleanDob,
      admissionDate: cleanAdmissionDate || new Date().toISOString().split('T')[0],
      phone: getVal(s.phone, d.phone),
      parentPhone: getVal(s.parentPhone, d.parentPhone),
      email: getVal(s.email, d.email),
      aadhaar: aadhaarVal,
      fatherName: getVal(s.fatherName, d.fatherName),
      fatherOccupation: getVal(s.fatherOccupation, d.fatherOccupation),
      motherName: getVal(s.motherName, d.motherName),
      familyIncome: getVal(s.familyIncome, d.familyIncome) || "Below 1 Lakh",
      qualification: getVal(s.qualification, d.qualification) || "12th Pass",
      bloodGroup: getVal(s.bloodGroup, d.bloodGroup) || "Unknown",
      address: getVal(s.address, d.address, d.fullAddress),
      addressStreet: getVal(s.addressStreet, d.addressStreet),
      city: getVal(s.city, d.city),
      district: getVal(s.district, d.district),
      state: getVal(s.state, d.state) || "Himachal Pradesh",
      pincode: getVal(s.pincode, d.pincode),
      course: getVal(s.course, d.course) || "DCA",
      courseDuration: getVal(s.courseDuration, d.courseDuration) || "6 Months",
      photo: getVal(s.photo, d.photo) || "https://via.placeholder.com/150",

      // 10th
      tenthSchool: getVal(ac.tenth?.school, s.tenthSchool, d.tenthSchool),
      tenthBoard: getVal(ac.tenth?.board, s.tenthBoard, d.tenthBoard),
      tenthYear: getVal(ac.tenth?.year, s.tenthYear, d.tenthYear),
      tenthPercentage: getVal(ac.tenth?.percentage, s.tenthPercentage, d.tenthPercentage),
      tenthDoc: ac.tenth?.document || s.tenthDoc || d.tenthDoc || "",

      // 12th
      twelfthSchool: getVal(ac.twelfth?.school, s.twelfthSchool, d.twelfthSchool),
      twelfthBoard: getVal(ac.twelfth?.board, s.twelfthBoard, d.twelfthBoard),
      twelfthYear: getVal(ac.twelfth?.year, s.twelfthYear, d.twelfthYear),
      twelfthPercentage: getVal(ac.twelfth?.percentage, s.twelfthPercentage, d.twelfthPercentage),
      twelfthDoc: ac.twelfth?.document || s.twelfthDoc || d.twelfthDoc || "",

      // College
      collegeName: getVal(ac.college?.college, s.collegeName, d.collegeName),
      collegeUniversity: getVal(ac.college?.university, s.collegeUniversity, d.collegeUniversity),
      collegeYear: getVal(ac.college?.year, s.collegeYear, d.collegeYear),
      collegePercentage: getVal(ac.college?.percentage, s.collegePercentage, d.collegePercentage),
      collegeDoc: ac.college?.document || s.collegeDoc || d.collegeDoc || ""
    };
  }, []);

  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current; y >= 2024; y--) list.push(y.toString());
    return list;
  }, []);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter(raw => {
      const s = parseStudent(raw);
      if (selectedYear !== "ALL") {
        const short = selectedYear.slice(-2);
        const matchId = s.studentId.toUpperCase().includes(`CYN-${short}`) || s.studentId.toUpperCase().includes(`CYN${short}`);
        const matchCreated = raw.createdAt && new Date(raw.createdAt).getFullYear().toString() === selectedYear;
        if (!matchId && !matchCreated) return false;
      }
      if (!term) return true;
      return (
        s.name.toLowerCase().includes(term) ||
        s.studentId.toLowerCase().includes(term) ||
        s.phone.includes(term)
      );
    });
  }, [students, searchTerm, selectedYear, parseStudent]);

  const handleDelete = async (id) => {
    if (window.confirm("Pakka delete karna hai? Record wapas nahi aayega!")) {
      const updated = students.filter(s => s._id !== id);
      setStudents(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      try {
        const res = await fetch(`${BASE_URL}/api/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } catch {
        alert("Delete fail! Re-syncing...");
        fetchStudents();
      }
    }
  };

  const handleResetTest = async (student) => {
    if (window.confirm(`${student.name} ka test RESET karein? Result clear ho jayega.`)) {
      const { _id, __v, createdAt, updatedAt, ...clean } = student;
      const payload = {
        ...clean,
        hasGivenTest: false,
        testScore: 0,
        testGrade: null,
        testDate: null,
        submittedExamPaper: null,
        paperSnapshot: null,
        examPaperData: null,
        details: {
          ...(student.details || {}),
          hasGivenTest: false,
          testScore: 0,
          testGrade: null,
          testDate: null,
          submittedExamPaper: null,
          paperSnapshot: null,
          examPaperData: null
        },
        certificateDetails: {
          ...(student.certificateDetails || {}),
          hasGivenTest: false,
          testScore: 0,
          grade: null
        }
      };

      const updated = students.map(s => s._id === student._id ? { ...s, ...payload } : s);
      setStudents(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      
      const sId = student.studentId || student.rollNo || student.regNo;
      if (sId) {
        localStorage.removeItem(`cyntax_test_done_${sId}`);
      }

      try {
        const res = await fetch(`${BASE_URL}/api/students/${student._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error();
        alert("Test reset ho gaya! Student ab dobara exam de sakta hai.");
      } catch {
        alert("Server update mein dikkat aayi! Re-syncing...");
      } finally {
        fetchStudents();
      }
    }
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo size must be less than 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setEditStudent(prev => ({ ...prev, photo: compressedBase64 }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDocUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Document file size must be less than 2MB!");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditStudent(prev => ({ ...prev, [fieldName]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const targetId = editStudent._id;
    const regId = (editStudent.studentId || "").trim().toUpperCase();
    const aadhaarVal = (editStudent.aadhaar || "").trim();
    const fullName = `${(editStudent.firstName || "").trim()} ${(editStudent.lastName || "").trim()}`.trim() || editStudent.name;

    const fullAddress = editStudent.addressStreet || editStudent.city || editStudent.district || editStudent.pincode
      ? `${(editStudent.addressStreet || "").trim()}, ${(editStudent.city || "").trim()}, Dist: ${(editStudent.district || "").trim()}, ${(editStudent.state || "").trim()} - ${(editStudent.pincode || "").trim()}`.replace(/^, |, $/g, '')
      : (editStudent.address || "").trim();

    const fullPayload = {
      ...editStudent,
      studentId: regId,
      rollNo: regId,
      regNo: regId,
      name: fullName,
      firstName: (editStudent.firstName || "").trim(),
      lastName: (editStudent.lastName || "").trim(),
      gender: editStudent.gender || "Male",
      dob: editStudent.dob || "",
      admissionDate: editStudent.admissionDate || "",
      joiningDate: editStudent.admissionDate || "",
      phone: (editStudent.phone || "").trim(),
      parentPhone: (editStudent.parentPhone || "").trim(),
      email: (editStudent.email || "").trim(),
      aadhaar: aadhaarVal,
      adaharNumber: aadhaarVal,
      adharNumber: aadhaarVal,
      aadharNumber: aadhaarVal,
      aadhaarNumber: aadhaarVal,
      fatherName: (editStudent.fatherName || "").trim(),
      fatherOccupation: (editStudent.fatherOccupation || "").trim(),
      motherName: (editStudent.motherName || "").trim(),
      familyIncome: editStudent.familyIncome || "Below 1 Lakh",
      qualification: editStudent.qualification || "12th Pass",
      bloodGroup: editStudent.bloodGroup || "Unknown",
      address: fullAddress,
      addressStreet: (editStudent.addressStreet || "").trim(),
      city: (editStudent.city || "").trim(),
      district: (editStudent.district || "").trim(),
      state: (editStudent.state || "").trim(),
      pincode: (editStudent.pincode || "").trim(),
      course: editStudent.course || "DCA",
      courseDuration: editStudent.courseDuration || "6 Months",
      photo: editStudent.photo || "https://via.placeholder.com/150",

      academics: {
        tenth: {
          school: (editStudent.tenthSchool || "").trim(),
          board: (editStudent.tenthBoard || "").trim(),
          year: (editStudent.tenthYear || "").trim(),
          percentage: (editStudent.tenthPercentage || "").trim(),
          document: editStudent.tenthDoc || ""
        },
        twelfth: {
          school: (editStudent.twelfthSchool || "").trim(),
          board: (editStudent.twelfthBoard || "").trim(),
          year: (editStudent.twelfthYear || "").trim(),
          percentage: (editStudent.twelfthPercentage || "").trim(),
          document: editStudent.twelfthDoc || ""
        },
        college: {
          college: (editStudent.collegeName || "").trim(),
          university: (editStudent.collegeUniversity || "").trim(),
          year: (editStudent.collegeYear || "").trim(),
          percentage: (editStudent.collegePercentage || "").trim(),
          document: editStudent.collegeDoc || ""
        }
      },

      details: {
        ...(editStudent.details || {}),
        studentId: regId,
        rollNo: regId,
        regNo: regId,
        name: fullName,
        firstName: (editStudent.firstName || "").trim(),
        lastName: (editStudent.lastName || "").trim(),
        gender: editStudent.gender || "Male",
        dob: editStudent.dob || "",
        admissionDate: editStudent.admissionDate || "",
        phone: (editStudent.phone || "").trim(),
        parentPhone: (editStudent.parentPhone || "").trim(),
        email: (editStudent.email || "").trim(),
        aadhaar: aadhaarVal,
        fatherName: (editStudent.fatherName || "").trim(),
        fatherOccupation: (editStudent.fatherOccupation || "").trim(),
        motherName: (editStudent.motherName || "").trim(),
        familyIncome: editStudent.familyIncome || "Below 1 Lakh",
        qualification: editStudent.qualification || "12th Pass",
        bloodGroup: editStudent.bloodGroup || "Unknown",
        addressStreet: (editStudent.addressStreet || "").trim(),
        city: (editStudent.city || "").trim(),
        district: (editStudent.district || "").trim(),
        state: (editStudent.state || "").trim(),
        pincode: (editStudent.pincode || "").trim(),
        fullAddress: fullAddress,
        tenthSchool: (editStudent.tenthSchool || "").trim(),
        tenthBoard: (editStudent.tenthBoard || "").trim(),
        tenthYear: (editStudent.tenthYear || "").trim(),
        tenthPercentage: (editStudent.tenthPercentage || "").trim(),
        tenthDoc: editStudent.tenthDoc || "",
        twelfthSchool: (editStudent.twelfthSchool || "").trim(),
        twelfthBoard: (editStudent.twelfthBoard || "").trim(),
        twelfthYear: (editStudent.twelfthYear || "").trim(),
        twelfthPercentage: (editStudent.twelfthPercentage || "").trim(),
        twelfthDoc: editStudent.twelfthDoc || "",
        collegeName: (editStudent.collegeName || "").trim(),
        collegeUniversity: (editStudent.collegeUniversity || "").trim(),
        collegeYear: (editStudent.collegeYear || "").trim(),
        collegePercentage: (editStudent.collegePercentage || "").trim(),
        collegeDoc: editStudent.collegeDoc || "",
        course: editStudent.course || "DCA",
        courseDuration: editStudent.courseDuration || "6 Months",
        photo: editStudent.photo || "https://via.placeholder.com/150"
      }
    };

    const updated = students.map(s => s._id === targetId ? { ...s, ...fullPayload } : s);
    setStudents(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setEditStudent(null);

    try {
      const res = await fetch(`${BASE_URL}/api/students/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      if (!res.ok) throw new Error();
      alert("Student data successfully updated!");
      fetchStudents();
    } catch {
      alert("Update failed! Reverting changes...");
      fetchStudents();
    }
  };

  const isTestDone = (s) => (
    s.hasGivenTest === true || s.hasGivenTest === "yes" || s.hasGivenTest === "true" ||
    s.details?.hasGivenTest === true ||
    s.certificateDetails?.hasGivenTest === true || 
    !!localStorage.getItem(`cyntax_test_done_${s.studentId}`)
  );

  const getExamPaper = (s) => {
    if (!s) return null;

    if (s.submittedExamPaper?.responses?.length) return s.submittedExamPaper;
    if (s.paperSnapshot?.responses?.length) return s.paperSnapshot;

    if (s.details?.submittedExamPaper?.responses?.length) return s.details.submittedExamPaper;
    if (s.details?.paperSnapshot?.responses?.length) return s.details.paperSnapshot;

    const rawStringData = s.examPaperData || s.details?.examPaperData || s.paperSnapshot || s.submittedExamPaper;
    if (typeof rawStringData === 'string' && rawStringData.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawStringData);
        if (parsed?.responses?.length) return parsed;
        if (parsed?.paperSnapshot?.responses?.length) return parsed.paperSnapshot;
      } catch (e) {}
    }

    const sId = s.studentId || s.rollNo || s.regNo;
    if (sId) {
      const local = localStorage.getItem(`cyntax_test_done_${sId}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed?.paperSnapshot?.responses?.length) return parsed.paperSnapshot;
          if (parsed?.responses?.length) return parsed;
        } catch (e) {}
      }
    }

    return null;
  };

  const calculateScore = (paper, student) => {
    if (paper?.responses?.length) {
      const total = paper.responses.length;
      let correct = 0;
      paper.responses.forEach(r => {
        const isAttempted = r.selectedAnswerIndex !== null && r.selectedAnswerIndex !== undefined;
        const isCorrect = isAttempted && (r.status === 'correct' || Number(r.selectedAnswerIndex) === Number(r.correctAnswerIndex));
        if (isCorrect) correct++;
      });
      const pct = total > 0 ? (correct / total) * 100 : 0;
      const grade = pct >= 85 ? "A++" : pct >= 65 ? "A+" : pct >= 50 ? "A" : pct >= 35 ? "B" : "Fail";
      return { total, correct, grade };
    }

    const fallbackScore = Number(student?.testScore ?? student?.details?.testScore ?? 0);
    const fallbackTotal = Number(paper?.totalQuestions ?? student?.submittedExamPaper?.totalQuestions ?? 0);
    const totalCount = fallbackTotal > 0 ? fallbackTotal : (fallbackScore > 0 ? fallbackScore : 0);
    const pct = totalCount > 0 ? (fallbackScore / totalCount) * 100 : 0;
    const grade = student?.testGrade || (pct >= 85 ? "A++" : pct >= 65 ? "A+" : pct >= 50 ? "A" : pct >= 35 ? "B" : "Fail");
    return { total: totalCount, correct: fallbackScore, grade };
  };

  const handlePrint = () => {
    const el = document.getElementById('printableResponseContent');
    if (!el) return;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return alert("Pop-up blocked!");
    w.document.write(`<!DOCTYPE html><html><head><title>Exam_Response_${viewPaperStudent?.student?.studentId || 'Paper'}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"><style>body{padding:25px;background:#fff;color:#0f172a;}.card-header-box{border:2px solid #0000FF;border-radius:10px;padding:15px;background:#f8fafc;margin-bottom:20px;}.question-box{border:1px solid #cbd5e1;border-radius:8px;padding:12px;margin-bottom:14px;page-break-inside:avoid;}.opt-row{padding:6px 12px;border-radius:6px;margin-bottom:5px;display:flex;justify-content:space-between;}.opt-correct{background:#dcfce7!important;border:1px solid #16a34a!important;color:#15803d!important;font-weight:bold;}.opt-wrong{background:#fee2e2!important;border:1px solid #dc2626!important;color:#b91c1c!important;font-weight:bold;}.opt-normal{background:#fff;border:1px solid #e2e8f0;color:#334155;}@media print{body{padding:10px;}@page{margin:12mm;}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 450);
  };

  return (
    <div className={`container-fluid mt-4 fade-in pb-5 ${certStudent ? 'p-0' : ''}`}>
      <style>{`
        .student-search-input::placeholder {
          color: rgba(255, 255, 255, 0.85) !important;
          opacity: 1 !important;
        }
      `}</style>

      <div className="card shadow-lg border-0 rounded-4 overflow-hidden no-print">
        <div className="card-header bg-dark py-3 px-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <h4 className="text-white mb-0 fw-bold">Student Database</h4>
            {isSyncing && <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}><i className="fas fa-sync-alt fa-spin me-1"></i> Syncing...</span>}
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center bg-secondary bg-opacity-25 rounded-3 px-2 py-1">
              <i className="far fa-calendar-alt text-warning me-2"></i>
              <select className="form-select form-select-sm border-0 bg-transparent text-white fw-bold shadow-none" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="ALL" className="text-dark">All Batches</option>
                {availableYears.map(yr => <option key={yr} value={yr} className="text-dark">{yr} Batch</option>)}
              </select>
            </div>
            <div className="position-relative" style={{ minWidth: '240px' }}>
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
              <input 
                type="text" 
                className="form-control form-control-sm ps-5 border-0 text-white student-search-input" 
                placeholder="Search name, roll no..." 
                style={{ backgroundColor: '#2c3e50', borderRadius: '8px', height: '36px' }} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button className="btn btn-warning btn-sm rounded-pill px-3 fw-bold" onClick={fetchStudents}><i className="fas fa-sync-alt"></i> Refresh</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase small">
              <tr>
                <th className="ps-4">Student</th>
                <th>Course</th>
                <th>Reg ID</th>
                <th>Test Status</th>
                <th>Response Sheet</th>
                <th>Reset Exam</th>
                <th>Issued Cert.</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((raw) => {
                  const s = parseStudent(raw);
                  const testDone = isTestDone(raw);
                  const paper = getExamPaper(raw);
                  const stats = calculateScore(paper, raw);

                  return (
                    <tr key={raw._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <img src={s.photo} alt="" className="rounded-circle border me-3" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                          <div><div className="fw-bold">{s.name}</div><small className="text-muted">{s.phone}</small></div>
                        </div>
                      </td>
                      <td><span className="badge bg-info text-dark">{s.course}</span></td>
                      <td className="font-monospace text-primary fw-bold small">{s.studentId}</td>
                      <td>
                        {testDone ? (
                          <div>
                            <span className="badge bg-success text-white px-2 py-1"><i className="fas fa-check-circle me-1"></i> Done</span>
                            <div className="small fw-bold text-dark mt-1">{stats.correct}/{stats.total} ({stats.grade})</div>
                          </div>
                        ) : <span className="badge bg-warning text-dark px-2 py-1"><i className="fas fa-clock me-1"></i> Pending</span>}
                      </td>
                      <td>
                        {testDone ? (
                          <button 
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" 
                            onClick={() => {
                              const activePaper = getExamPaper(raw);
                              setViewPaperStudent({ student: s, paper: activePaper });
                            }}
                          >
                            <i className="fas fa-file-alt me-1"></i> View Paper
                          </button>
                        ) : <span className="text-muted small">No Paper</span>}
                      </td>
                      <td>
                        {testDone ? (
                          <button className="btn btn-sm btn-outline-danger rounded-pill fw-bold" onClick={() => handleResetTest(raw)} title="Reset Test">
                            <i className="fas fa-redo-alt me-1"></i> Reset
                          </button>
                        ) : <span className="text-muted small">Not required</span>}
                      </td>
                      <td>
                        {raw.isCertificateIssued ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3" style={{ cursor: 'pointer' }} onClick={() => setCertStudent(raw)}>
                            <i className="fas fa-check-circle me-1"></i> Yes (View)
                          </span>
                        ) : <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3"><i className="fas fa-times-circle me-1"></i> No</span>}
                      </td>
                      <td className="text-center pe-4">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" title="View Biodata" onClick={() => setSelectedStudent(parseStudent(raw))}><i className="fas fa-eye"></i></button>
                          <button className="btn btn-sm btn-outline-warning" title="Edit Student" onClick={() => setEditStudent(parseStudent(raw))}><i className="fas fa-edit"></i></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(raw._id)}><i className="fas fa-trash"></i></button>
                          <button className="btn btn-sm btn-outline-dark" onClick={() => setCertStudent(raw)}><i className="fas fa-certificate text-dark"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" className="text-center py-4 text-muted">Koi student record nahi mila.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW BIODATA MODAL */}
      {selectedStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom bg-white shadow-lg" style={{ maxWidth: '900px', width: '95%', borderRadius: '18px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold"><i className="fas fa-id-card me-2"></i> Student Complete Bio-Data</h5>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="p-4" style={{ overflowY: 'auto' }}>
              <div className="row g-4">
                <div className="col-md-3 text-center border-end">
                  <img src={selectedStudent.photo} className="img-fluid rounded-4 shadow-sm mb-3" style={{ border: '3px solid #0000FF', width: '130px', height: '130px', objectFit: 'cover' }} alt="" />
                  <h5 className="fw-bold text-dark mb-1">{selectedStudent.name}</h5>
                  <span className="badge bg-dark font-monospace mb-2">{selectedStudent.studentId}</span>
                  <div><span className="badge bg-info text-dark">{selectedStudent.course}</span></div>
                  <small className="text-muted d-block mt-1">Duration: {selectedStudent.courseDuration}</small>
                  <small className="text-muted d-block mt-1">Admission: <b>{selectedStudent.admissionDate || "N/A"}</b></small>
                </div>
                <div className="col-md-9">
                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">1. Personal & Identity Details</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6"><small className="text-muted d-block">Gender</small><strong>{selectedStudent.gender || "Male"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Date of Birth</small><strong>{selectedStudent.dob || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Student Mobile Number</small><strong>{selectedStudent.phone || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Parents Mobile Number</small><strong>{selectedStudent.parentPhone || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Email Address</small><strong className="text-primary">{selectedStudent.email || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Aadhaar Card Number</small><strong className="text-danger font-monospace">{selectedStudent.aadhaar || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Blood Group</small><strong className="text-danger">{selectedStudent.bloodGroup || "Unknown"}</strong></div>
                  </div>

                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">2. Family Background & Occupation</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6"><small className="text-muted d-block">Father's Name</small><strong>{selectedStudent.fatherName || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Father's Occupation</small><strong>{selectedStudent.fatherOccupation || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Mother's Name</small><strong>{selectedStudent.motherName || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Annual Family Income</small><strong className="text-success">{selectedStudent.familyIncome || "Below 1 Lakh"}</strong></div>
                    <div className="col-sm-12"><small className="text-muted d-block">Residential Address</small><strong>{selectedStudent.address || "Not Provided"}</strong></div>
                  </div>

                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">3. Academic Qualifications & Attached Documents</h6>
                  <div className="row g-2">
                    <div className="col-12 p-2 bg-light rounded-3 mb-2">
                      <div className="fw-bold text-dark mb-1">10th Standard:</div>
                      <div className="small text-muted">
                        School: <b>{selectedStudent.tenthSchool || "N/A"}</b> | Board: <b>{selectedStudent.tenthBoard || "N/A"}</b> | Year: <b>{selectedStudent.tenthYear || "N/A"}</b> | Percentage: <b>{selectedStudent.tenthPercentage || "N/A"}</b>
                      </div>
                      {selectedStudent.tenthDoc ? (
                        <a href={selectedStudent.tenthDoc} download={`10th_Certificate_${selectedStudent.studentId}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success mt-1 py-0 px-2 fw-bold">
                          <i className="fas fa-file-download me-1"></i> View 10th Certificate
                        </a>
                      ) : <span className="small text-muted d-block mt-1">No 10th document attached</span>}
                    </div>

                    <div className="col-12 p-2 bg-light rounded-3 mb-2">
                      <div className="fw-bold text-dark mb-1">12th Standard:</div>
                      <div className="small text-muted">
                        School/College: <b>{selectedStudent.twelfthSchool || "N/A"}</b> | Board: <b>{selectedStudent.twelfthBoard || "N/A"}</b> | Year: <b>{selectedStudent.twelfthYear || "N/A"}</b> | Percentage: <b>{selectedStudent.twelfthPercentage || "N/A"}</b>
                      </div>
                      {selectedStudent.twelfthDoc ? (
                        <a href={selectedStudent.twelfthDoc} download={`12th_Certificate_${selectedStudent.studentId}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success mt-1 py-0 px-2 fw-bold">
                          <i className="fas fa-file-download me-1"></i> View 12th Certificate
                        </a>
                      ) : <span className="small text-muted d-block mt-1">No 12th document attached</span>}
                    </div>

                    <div className="col-12 p-2 bg-light rounded-3">
                      <div className="fw-bold text-dark mb-1">Graduation / Degree:</div>
                      <div className="small text-muted">
                        College: <b>{selectedStudent.collegeName || "N/A"}</b> | University: <b>{selectedStudent.collegeUniversity || "N/A"}</b> | Year: <b>{selectedStudent.collegeYear || "N/A"}</b> | Percentage: <b>{selectedStudent.collegePercentage || "N/A"}</b>
                      </div>
                      {selectedStudent.collegeDoc ? (
                        <a href={selectedStudent.collegeDoc} download={`Degree_${selectedStudent.studentId}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success mt-1 py-0 px-2 fw-bold">
                          <i className="fas fa-file-download me-1"></i> View Degree Document
                        </a>
                      ) : <span className="small text-muted d-block mt-1">No college document attached</span>}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="p-3 bg-light border-top text-end">
              <button className="btn btn-secondary btn-sm px-4 rounded-pill" onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FULLY SYNCHRONIZED COMPREHENSIVE EDIT MODAL */}
      {editStudent && (
        <div 
          className="modal-overlay no-print" 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.85)', 
            zIndex: 99999, 
            overflowY: 'auto',
            padding: '30px 15px'
          }}
        >
          <div 
            style={{ 
              backgroundColor: '#ffffff',
              maxWidth: '1050px', 
              margin: '0 auto', 
              borderRadius: '24px', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{ 
                padding: '18px 25px', 
                backgroundColor: '#1e293b', 
                color: '#ffffff', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <h5 className="fw-bold mb-0 text-white">
                <i className="fas fa-user-edit text-warning me-2"></i> Update Complete Student Profile & Credentials
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setEditStudent(null)}
              ></button>
            </div>

            <form onSubmit={handleUpdate} style={{ padding: '28px' }}>
              
              {/* Profile Photo Preview & Change */}
              <div className="text-center mb-4 pb-3 border-bottom">
                <div className="d-inline-block position-relative">
                  <img 
                    src={editStudent.photo || "https://via.placeholder.com/150"} 
                    alt="Student Preview" 
                    style={{
                      width: '110px',
                      height: '110px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '4px solid #0000FF',
                      boxShadow: '0 6px 16px rgba(0, 0, 255, 0.2)'
                    }}
                  />
                  <label 
                    htmlFor="editPhotoUploadInput" 
                    className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0 shadow"
                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Change Student Photo"
                  >
                    <i className="fas fa-camera"></i>
                  </label>
                  <input 
                    id="editPhotoUploadInput"
                    type="file" 
                    accept="image/*"
                    onChange={handleEditPhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="mt-2">
                  <span className="fw-bold text-dark d-block">Student Photograph</span>
                  <small className="text-muted">Click the camera button to replace (Max: 2MB JPG/PNG)</small>
                </div>
              </div>

              <div className="row g-3">
                {/* 1. REGISTRATION & COURSE */}
                <div className="col-12"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">1. Registration & Course Details</h6></div>
                
                <div className="col-md-3">
                  <label className="small fw-bold text-dark">Registration ID *</label>
                  <input type="text" className="form-control font-monospace fw-bold text-primary" value={editStudent.studentId || ""} onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value.toUpperCase() })} required />
                </div>

                <div className="col-md-3">
                  <label className="small fw-bold text-dark">Course Enrolled *</label>
                  <select className="form-select" value={editStudent.course || "DCA"} onChange={(e) => setEditStudent({ ...editStudent, course: e.target.value })}>
                    <option value="DCA">DCA (Diploma in Computer Applications)</option>
                    <option value="ADCA">ADCA (Advanced Diploma)</option>
                    <option value="Steno">Stenography & Shorthand</option>
                    <option value="Short Term">Short Term / Web Development</option>
                    <option value="Tally">Tally Prime & Accounting</option>
                    <option value="Basic">Basic Computer Operations</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="small fw-bold text-dark">Course Duration</label>
                  <input type="text" className="form-control" value={editStudent.courseDuration || ""} onChange={(e) => setEditStudent({ ...editStudent, courseDuration: e.target.value })} />
                </div>

                <div className="col-md-3">
                  <label className="small fw-bold text-dark">Admission Date *</label>
                  <input type="date" className="form-control" value={editStudent.admissionDate || ""} onChange={(e) => setEditStudent({ ...editStudent, admissionDate: e.target.value })} required />
                </div>

                {/* 2. PERSONAL DETAILS */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">2. Personal & Identity Details</h6></div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">First Name *</label>
                  <input type="text" className="form-control" value={editStudent.firstName || ""} onChange={(e) => setEditStudent({ ...editStudent, firstName: e.target.value })} required />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Last Name</label>
                  <input type="text" className="form-control" value={editStudent.lastName || ""} onChange={(e) => setEditStudent({ ...editStudent, lastName: e.target.value })} />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Gender *</label>
                  <select className="form-select" value={editStudent.gender || "Male"} onChange={(e) => setEditStudent({ ...editStudent, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Date of Birth (Login Password) *</label>
                  <input type="date" className="form-control" value={editStudent.dob || ""} onChange={(e) => setEditStudent({ ...editStudent, dob: e.target.value })} required />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-danger">Aadhaar Card Number *</label>
                  <input type="text" className="form-control font-monospace border-danger" maxLength="12" value={editStudent.aadhaar || ""} onChange={(e) => setEditStudent({ ...editStudent, aadhaar: e.target.value.replace(/[^0-9]/g, '') })} required />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Blood Group</label>
                  <select className="form-select" value={editStudent.bloodGroup || "Unknown"} onChange={(e) => setEditStudent({ ...editStudent, bloodGroup: e.target.value })}>
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Student Mobile Number *</label>
                  <input type="tel" className="form-control" maxLength="10" value={editStudent.phone || ""} onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value.replace(/[^0-9]/g, '') })} required />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Parents / Guardian Mobile Number</label>
                  <input type="tel" className="form-control" maxLength="10" value={editStudent.parentPhone || ""} onChange={(e) => setEditStudent({ ...editStudent, parentPhone: e.target.value.replace(/[^0-9]/g, '') })} />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Email Address</label>
                  <input type="email" className="form-control" value={editStudent.email || ""} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} placeholder="student@example.com" />
                </div>

                {/* 3. PARENTAGE & SOCIO-ECONOMIC */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">3. Parentage & Family Details</h6></div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Father's Full Name</label>
                  <input type="text" className="form-control" value={editStudent.fatherName || ""} onChange={(e) => setEditStudent({ ...editStudent, fatherName: e.target.value })} />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Father's Occupation</label>
                  <input type="text" className="form-control" value={editStudent.fatherOccupation || ""} onChange={(e) => setEditStudent({ ...editStudent, fatherOccupation: e.target.value })} />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Mother's Full Name</label>
                  <input type="text" className="form-control" value={editStudent.motherName || ""} onChange={(e) => setEditStudent({ ...editStudent, motherName: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold text-dark">Annual Family Income</label>
                  <select className="form-select" value={editStudent.familyIncome || "Below 1 Lakh"} onChange={(e) => setEditStudent({ ...editStudent, familyIncome: e.target.value })}>
                    <option value="Below 1 Lakh">Below ₹1,00,000</option>
                    <option value="1 Lakh - 2.5 Lakhs">₹1,00,000 - ₹2,50,000</option>
                    <option value="2.5 Lakhs - 5 Lakhs">₹2,50,000 - ₹5,00,000</option>
                    <option value="Above 5 Lakhs">Above ₹5,00,000</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold text-dark">Highest Qualification</label>
                  <select className="form-select" value={editStudent.qualification || "12th Pass"} onChange={(e) => setEditStudent({ ...editStudent, qualification: e.target.value })}>
                    <option value="10th Pass">10th Matriculation</option>
                    <option value="12th Pass">12th Intermediate</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Other">Other Diploma</option>
                  </select>
                </div>

                {/* 4. RESIDENTIAL ADDRESS */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">4. Residential Address Details</h6></div>

                <div className="col-md-6">
                  <label className="small fw-bold text-dark">Street Address / Village</label>
                  <input type="text" className="form-control" value={editStudent.addressStreet || ""} onChange={(e) => setEditStudent({ ...editStudent, addressStreet: e.target.value })} placeholder="House No, Street, Village, Post Office" />
                </div>

                <div className="col-md-3">
                  <label className="small fw-bold text-dark">City / Tehsil</label>
                  <input type="text" className="form-control" value={editStudent.city || ""} onChange={(e) => setEditStudent({ ...editStudent, city: e.target.value })} placeholder="City / Tehsil" />
                </div>

                <div className="col-md-3">
                  <label className="small fw-bold text-dark">District</label>
                  <input type="text" className="form-control" value={editStudent.district || ""} onChange={(e) => setEditStudent({ ...editStudent, district: e.target.value })} placeholder="District" />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold text-dark">State</label>
                  <input type="text" className="form-control" value={editStudent.state || ""} onChange={(e) => setEditStudent({ ...editStudent, state: e.target.value })} placeholder="State" />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold text-dark">Postal PIN Code</label>
                  <input type="text" className="form-control font-monospace" maxLength="6" value={editStudent.pincode || ""} onChange={(e) => setEditStudent({ ...editStudent, pincode: e.target.value.replace(/[^0-9]/g, '') })} placeholder="6-digit PIN" />
                </div>

                {/* 5. ACADEMIC DETAILS & ATTACHMENTS */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">5. Educational Qualifications & Documents (PDF/JPG/PNG up to 2MB)</h6></div>

                {/* 10th */}
                <div className="col-12 p-3 bg-light rounded-3 border mb-2">
                  <h6 className="fw-bold text-dark mb-2"><i className="fas fa-graduation-cap me-2 text-primary"></i> 10th Standard (Matriculation)</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="small text-muted fw-bold">School Name</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.tenthSchool || ""} onChange={(e) => setEditStudent({ ...editStudent, tenthSchool: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="small text-muted fw-bold">Board (e.g. HPBOSE / CBSE)</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.tenthBoard || ""} onChange={(e) => setEditStudent({ ...editStudent, tenthBoard: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <label className="small text-muted fw-bold">Passing Year</label>
                      <input type="text" className="form-control form-control-sm" maxLength="4" value={editStudent.tenthYear || ""} onChange={(e) => setEditStudent({ ...editStudent, tenthYear: e.target.value.replace(/[^0-9]/g, '') })} />
                    </div>
                    <div className="col-md-3">
                      <label className="small text-muted fw-bold">Percentage / CGPA</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.tenthPercentage || ""} onChange={(e) => setEditStudent({ ...editStudent, tenthPercentage: e.target.value })} />
                    </div>
                    <div className="col-12 mt-2">
                      <label className="small fw-bold text-primary">Upload / Replace 10th Certificate (PDF/Image)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf,image/*" onChange={(e) => handleEditDocUpload(e, 'tenthDoc')} />
                      {editStudent.tenthDoc && <small className="text-success fw-bold d-block mt-1">✓ Certificate currently attached</small>}
                    </div>
                  </div>
                </div>

                {/* 12th */}
                <div className="col-12 p-3 bg-light rounded-3 border mb-2">
                  <h6 className="fw-bold text-dark mb-2"><i className="fas fa-graduation-cap me-2 text-primary"></i> 12th Standard (Higher Secondary)</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="small text-muted fw-bold">School / College Name</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.twelfthSchool || ""} onChange={(e) => setEditStudent({ ...editStudent, twelfthSchool: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="small text-muted fw-bold">Board (e.g. HPBOSE / CBSE)</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.twelfthBoard || ""} onChange={(e) => setEditStudent({ ...editStudent, twelfthBoard: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <label className="small text-muted fw-bold">Passing Year</label>
                      <input type="text" className="form-control form-control-sm" maxLength="4" value={editStudent.twelfthYear || ""} onChange={(e) => setEditStudent({ ...editStudent, twelfthYear: e.target.value.replace(/[^0-9]/g, '') })} />
                    </div>
                    <div className="col-md-3">
                      <label className="small text-muted fw-bold">Percentage / CGPA</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.twelfthPercentage || ""} onChange={(e) => setEditStudent({ ...editStudent, twelfthPercentage: e.target.value })} />
                    </div>
                    <div className="col-12 mt-2">
                      <label className="small fw-bold text-primary">Upload / Replace 12th Certificate (PDF/Image)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf,image/*" onChange={(e) => handleEditDocUpload(e, 'twelfthDoc')} />
                      {editStudent.twelfthDoc && <small className="text-success fw-bold d-block mt-1">✓ Certificate currently attached</small>}
                    </div>
                  </div>
                </div>

                {/* College */}
                <div className="col-12 p-3 bg-light rounded-3 border mb-3">
                  <h6 className="fw-bold text-dark mb-2"><i className="fas fa-university me-2 text-primary"></i> Graduation / College Degree (Optional)</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="small text-muted fw-bold">College Name</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.collegeName || ""} onChange={(e) => setEditStudent({ ...editStudent, collegeName: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="small text-muted fw-bold">University (e.g. HPU / IGNOU)</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.collegeUniversity || ""} onChange={(e) => setEditStudent({ ...editStudent, collegeUniversity: e.target.value })} />
                    </div>
                    <div className="col-md-2">
                      <label className="small text-muted fw-bold">Passing Year</label>
                      <input type="text" className="form-control form-control-sm" maxLength="4" value={editStudent.collegeYear || ""} onChange={(e) => setEditStudent({ ...editStudent, collegeYear: e.target.value.replace(/[^0-9]/g, '') })} />
                    </div>
                    <div className="col-md-3">
                      <label className="small text-muted fw-bold">Aggregate Percentage</label>
                      <input type="text" className="form-control form-control-sm" value={editStudent.collegePercentage || ""} onChange={(e) => setEditStudent({ ...editStudent, collegePercentage: e.target.value })} />
                    </div>
                    <div className="col-12 mt-2">
                      <label className="small fw-bold text-primary">Upload / Replace College Document (PDF/Image)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf,image/*" onChange={(e) => handleEditDocUpload(e, 'collegeDoc')} />
                      {editStudent.collegeDoc && <small className="text-success fw-bold d-block mt-1">✓ Degree document currently attached</small>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-12 mt-4 pt-4 border-top d-flex justify-content-end align-items-center gap-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold" 
                    onClick={() => setEditStudent(null)}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    className="btn btn-warning px-5 py-2 rounded-pill fw-bold text-dark shadow"
                    style={{ fontSize: '16px' }}
                  >
                    <i className="fas fa-save me-2"></i> Update Student Data
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPONSE SHEET MODAL */}
      {viewPaperStudent && (() => {
        const stats = calculateScore(viewPaperStudent.paper, viewPaperStudent.student);
        const paperData = viewPaperStudent.paper;
        const studentInfo = viewPaperStudent.student;
        const responsesList = paperData?.responses || [];

        return (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 10000, overflowY: 'auto', padding: '20px 10px' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
              <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white border-bottom">
                <h5 className="mb-0 fw-bold"><i className="fas fa-file-invoice me-2 text-warning"></i> Candidate Exam Response Sheet</h5>
                <div className="d-flex gap-2">
                  <button className="btn btn-success btn-sm rounded-pill px-3 fw-bold" onClick={handlePrint}><i className="fas fa-print me-1"></i> Print PDF</button>
                  <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold" onClick={() => setViewPaperStudent(null)}>✕ Close</button>
                </div>
              </div>

              <div id="printableResponseContent" className="p-4" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                <div className="text-center mb-4 pb-2 border-bottom">
                  <h3 style={{ fontWeight: '900', color: '#0000FF', margin: 0 }}>CYNTAX CODING HUB & IT INSTITUTE</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Candidate Assessment & Official Evaluation Sheet</p>
                </div>

                <div className="card-header-box" style={{ border: '2px solid #0000FF', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', marginBottom: '25px' }}>
                  <div className="row g-2">
                    <div className="col-sm-6"><span className="text-muted small d-block">Candidate:</span><strong className="fs-6 text-primary">{studentInfo.name}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Roll No:</span><strong className="fs-6 font-monospace">{studentInfo.studentId}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Course:</span><strong>{studentInfo.course}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Exam Date:</span><strong>{paperData?.submittedAt || paperData?.examDate || studentInfo.testDate || 'Recorded'}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Score Obtained:</span><span className={`badge ${stats.grade === 'Fail' ? 'bg-danger' : 'bg-success'} fs-6`}>{stats.correct} / {stats.total}</span></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Overall Grade:</span><span className={`badge ${stats.grade === 'Fail' ? 'bg-danger' : 'bg-primary'} fs-6`}>{stats.grade}</span></div>
                  </div>
                </div>

                {responsesList.length > 0 ? (
                  responsesList.map((r, qIdx) => {
                    const isAttempted = r.selectedAnswerIndex !== null && r.selectedAnswerIndex !== undefined;
                    const isCorrect = isAttempted && (r.status === 'correct' || Number(r.selectedAnswerIndex) === Number(r.correctAnswerIndex));
                    
                    return (
                      <div key={qIdx} className="question-box" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px', backgroundColor: isCorrect ? '#f0fdf4' : !isAttempted ? '#f8fafc' : '#fef2f2', pageBreakInside: 'avoid' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="fw-bold text-dark">Q{r.qIndex || qIdx + 1}. {r.questionText}</span>
                          <span className={`badge ${isCorrect ? 'bg-success' : !isAttempted ? 'bg-secondary' : 'bg-danger'} ms-2`}>
                            {isCorrect ? 'Correct (+1)' : !isAttempted ? 'Unattempted (0)' : 'Incorrect (0)'}
                          </span>
                        </div>

                        <div className="mt-2 ms-1">
                          {r.options && r.options.map((opt, optIdx) => {
                            const isSelected = isAttempted && Number(r.selectedAnswerIndex) === optIdx;
                            const isCorrectOpt = Number(r.correctAnswerIndex) === optIdx;
                            const optClass = isCorrectOpt ? 'opt-correct' : isSelected ? 'opt-wrong' : 'opt-normal';

                            return (
                              <div key={optIdx} className={`opt-row ${optClass}`} style={{ padding: '8px 12px', borderRadius: '6px', marginBottom: '6px' }}>
                                <span><b>{String.fromCharCode(65 + optIdx)}.</b> {opt}</span>
                                <span>
                                  {isSelected && <span className="badge bg-dark ms-2">Candidate's Choice</span>}
                                  {isCorrectOpt && <span className="badge bg-success ms-2">✓ Correct Answer</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="alert alert-warning text-center py-4">
                    <h5>Paper Snapshot Not Found in Current Cache</h5>
                    <p className="small mb-0 text-muted">Test score ({stats.correct}/{stats.total}) record ho chuka hai, par detailed paper format synchronize nahi hua.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* CERTIFICATE MODAL */}
      {certStudent && (
        <div className="modal-overlay no-print-bg" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, overflowY: 'auto' }}>
          <div className="modal-content-custom bg-white mx-auto" style={{ maxWidth: '98%', width: '1250px', borderRadius: '15px', position: 'relative', top: '160px' }}>
            <div className="no-print d-flex justify-content-between align-items-center p-3 border-bottom bg-dark text-white rounded-top-4">
              <h5 className="mb-0 fw-bold">Certificate Portal</h5>
              <button className="btn-close btn-close-white" onClick={() => setCertStudent(null)}></button>
            </div>
            <Certificate preFillData={certStudent} onSuccess={() => { fetchStudents(); setCertStudent(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;