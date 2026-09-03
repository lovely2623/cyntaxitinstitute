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

  // COMPLETE MULTI-LAYER PARSER: Root aur Details object dono scan karega
  const parseStudent = useCallback((s) => {
    if (!s) return {};
    const d = s.details || s.additionalDetails || {};

    let cleanDob = "";
    const rawDob = s.dob || d.dob || "";
    if (rawDob) {
      cleanDob = rawDob.includes("T") ? rawDob.split("T")[0] : rawDob.replace(/\//g, "-");
      if (cleanDob.includes("-") && cleanDob.split("-")[0].length !== 4) {
        const p = cleanDob.split("-");
        if (p.length === 3 && p[2].length === 4) cleanDob = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
      }
    }

    const regId = (s.studentId || s.rollNo || s.regNo || d.studentId || d.rollNo || "").toString().trim();
    
    // Aadhaar scan from all possible variations
    const aadhaarVal = (
      s.aadhaar || s.adaharNumber || s.adharNumber || s.aadharNumber || s.aadhaarNumber || s.adahar || s.adhar || s.aadhar ||
      d.aadhaar || d.adaharNumber || d.adharNumber || d.aadharNumber || d.aadhaarNumber || d.adahar || d.adhar || d.aadhar || ""
    ).toString().trim();

    const emailVal = (s.email || d.email || "").toString().trim();
    const fatherOccupationVal = (s.fatherOccupation || d.fatherOccupation || "").toString().trim();
    const bloodGroupVal = (s.bloodGroup || d.bloodGroup || "Unknown").toString().trim();
    const familyIncomeVal = (s.familyIncome || d.familyIncome || "Below 1 Lakh").toString().trim();
    const qualificationVal = (s.qualification || d.qualification || "12th Pass").toString().trim();
    const addressVal = (s.address || d.address || "").toString().trim();
    const genderVal = (s.gender || d.gender || "Male").toString().trim();

    return {
      ...s,
      studentId: regId,
      name: (s.name || d.name || "").toString().trim(),
      gender: genderVal,
      dob: cleanDob,
      phone: (s.phone || d.phone || "").toString().trim(),
      email: emailVal,
      aadhaar: aadhaarVal,
      fatherName: (s.fatherName || d.fatherName || "").toString().trim(),
      fatherOccupation: fatherOccupationVal,
      motherName: (s.motherName || d.motherName || "").toString().trim(),
      familyIncome: familyIncomeVal,
      qualification: qualificationVal,
      bloodGroup: bloodGroupVal,
      address: addressVal,
      course: (s.course || d.course || "DCA").toString().trim(),
      courseDuration: (s.courseDuration || d.courseDuration || "6 Months").toString().trim(),
      photo: s.photo || d.photo || "https://via.placeholder.com/150"
    };
  }, []);

  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current; y >= 2025; y--) list.push(y.toString());
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
        certificateDetails: { ...(student.certificateDetails || {}), hasGivenTest: false, testScore: 0 }
      };
      const updated = students.map(s => s._id === student._id ? { ...s, ...payload } : s);
      setStudents(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      localStorage.removeItem(`cyntax_test_done_${student.studentId}`);
      try {
        await fetch(`${BASE_URL}/api/students/${student._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert("Test reset ho gaya! Status: Pending");
      } catch {
        fetchStudents();
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const targetId = editStudent._id;
    const regId = (editStudent.studentId || "").trim().toUpperCase();
    const aadhaarVal = (editStudent.aadhaar || "").trim();

    const fullPayload = {
      ...editStudent,
      studentId: regId,
      rollNo: regId,
      regNo: regId,
      name: editStudent.name.trim(),
      gender: editStudent.gender || "Male",
      dob: editStudent.dob,
      phone: editStudent.phone.trim(),
      email: editStudent.email.trim(),
      aadhaar: aadhaarVal,
      adaharNumber: aadhaarVal,
      adharNumber: aadhaarVal,
      aadharNumber: aadhaarVal,
      fatherName: editStudent.fatherName.trim(),
      fatherOccupation: editStudent.fatherOccupation.trim(),
      motherName: editStudent.motherName.trim(),
      familyIncome: editStudent.familyIncome,
      qualification: editStudent.qualification,
      bloodGroup: editStudent.bloodGroup,
      address: editStudent.address.trim(),
      course: editStudent.course,
      courseDuration: editStudent.courseDuration,
      details: {
        ...(editStudent.details || {}),
        studentId: regId,
        aadhaar: aadhaarVal,
        adaharNumber: aadhaarVal,
        fatherOccupation: editStudent.fatherOccupation.trim(),
        familyIncome: editStudent.familyIncome,
        qualification: editStudent.qualification,
        bloodGroup: editStudent.bloodGroup,
        address: editStudent.address.trim(),
        email: editStudent.email.trim(),
        gender: editStudent.gender
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
      alert("Student data successfully update ho gaya!");
    } catch {
      alert("Update fail! Reverting changes...");
      fetchStudents();
    }
  };

  const isTestDone = (s) => (
    s.hasGivenTest === true || s.hasGivenTest === "yes" || s.hasGivenTest === "true" ||
    s.certificateDetails?.hasGivenTest === true || !!localStorage.getItem(`cyntax_test_done_${s.studentId}`)
  );

  const getExamPaper = (s) => {
    if (s.submittedExamPaper?.responses) return s.submittedExamPaper;
    const local = localStorage.getItem(`cyntax_test_done_${s.studentId}`);
    if (local) {
      try { return JSON.parse(local).paperSnapshot || null; } catch {}
    }
    return null;
  };

  const calculateScore = (paper, student) => {
    if (paper?.responses?.length) {
      const total = paper.responses.length;
      let correct = 0;
      paper.responses.forEach(r => {
        if (r.selectedAnswerIndex !== null && r.selectedAnswerIndex !== undefined &&
           (r.status === 'correct' || Number(r.selectedAnswerIndex) === Number(r.correctAnswerIndex))) {
          correct++;
        }
      });
      const pct = (correct / total) * 100;
      const grade = pct >= 80 ? "A++" : pct >= 65 ? "A+" : pct >= 50 ? "A" : pct >= 35 ? "B" : "Fail";
      return { total, correct, grade };
    }
    const fallbackScore = Number(student?.testScore) || 0;
    const fallbackTotal = paper?.totalQuestions || 2;
    const pct = (fallbackScore / fallbackTotal) * 100;
    const grade = pct >= 80 ? "A++" : pct >= 65 ? "A+" : pct >= 50 ? "A" : pct >= 35 ? "B" : "Fail";
    return { total: fallbackTotal, correct: fallbackScore, grade };
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
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" className="form-control form-control-sm ps-5 border-0 text-white" placeholder="Search name, roll no..." style={{ backgroundColor: '#2c3e50', borderRadius: '8px', height: '36px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                          <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => setViewPaperStudent({ student: s, paper })}>
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
                          {/* VIEW: Deep Parsed Student */}
                          <button className="btn btn-sm btn-outline-primary" title="View Biodata" onClick={() => setSelectedStudent(parseStudent(raw))}><i className="fas fa-eye"></i></button>
                          {/* EDIT: Deep Parsed Student */}
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

      {/* VIEW MODAL (Accurate Deep Resolved Info) */}
      {selectedStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom bg-white shadow-lg" style={{ maxWidth: '850px', width: '95%', borderRadius: '18px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
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
                </div>
                <div className="col-md-9">
                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">1. Personal & Identity Details</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6"><small className="text-muted d-block">Gender</small><strong>{selectedStudent.gender || "Male"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Date of Birth</small><strong>{selectedStudent.dob || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Mobile Number</small><strong>{selectedStudent.phone}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Email Address</small><strong className="text-primary">{selectedStudent.email || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Aadhaar Card Number</small><strong className="text-danger font-monospace">{selectedStudent.aadhaar || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Blood Group</small><strong className="text-danger">{selectedStudent.bloodGroup || "Unknown"}</strong></div>
                    <div className="col-sm-12"><small className="text-muted d-block">Highest Qualification</small><strong>{selectedStudent.qualification || "12th Pass"}</strong></div>
                  </div>
                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">2. Family Background & Occupation</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6"><small className="text-muted d-block">Father's Name</small><strong>{selectedStudent.fatherName || "N/A"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Father's Occupation</small><strong>{selectedStudent.fatherOccupation || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Mother's Name</small><strong>{selectedStudent.motherName || "N/A"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Annual Family Income</small><strong className="text-success">{selectedStudent.familyIncome || "Below 1 Lakh"}</strong></div>
                    <div className="col-sm-12"><small className="text-muted d-block">Permanent Address</small><strong>{selectedStudent.address || "Not Provided"}</strong></div>
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

      {/* EDIT MODAL (All Fields Pre-Filled & Editable) */}
      {editStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="modal-content-custom p-4 bg-white shadow-lg" style={{ maxWidth: '900px', width: '95%', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h4 className="fw-bold text-warning mb-0"><i className="fas fa-user-edit me-2"></i> Update Student Record</h4>
              <button className="btn-close" onClick={() => setEditStudent(null)}></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-12"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">1. Academic & Registration</h6></div>
                <div className="col-md-4">
                  <label className="small fw-bold">Registration ID *</label>
                  <input type="text" className="form-control font-monospace fw-bold text-primary" value={editStudent.studentId || ""} onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value.toUpperCase() })} required />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Course *</label>
                  <select className="form-select" value={editStudent.course || "DCA"} onChange={(e) => setEditStudent({ ...editStudent, course: e.target.value })}>
                    <option value="DCA">DCA</option><option value="ADCA">ADCA</option><option value="Steno">Stenography & Shorthand</option>
                    <option value="Short Term">Short Term / Web Dev</option><option value="Tally">Tally Prime & Accounting</option><option value="Basic">Basic Computer</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Duration</label>
                  <input type="text" className="form-control" value={editStudent.courseDuration || ""} onChange={(e) => setEditStudent({ ...editStudent, courseDuration: e.target.value })} />
                </div>

                <div className="col-12 mt-3"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">2. Personal & Identity Details</h6></div>
                <div className="col-md-4">
                  <label className="small fw-bold">Full Name *</label>
                  <input type="text" className="form-control" value={editStudent.name || ""} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Gender</label>
                  <select className="form-select" value={editStudent.gender || "Male"} onChange={(e) => setEditStudent({ ...editStudent, gender: e.target.value })}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Date of Birth (Password) *</label>
                  <input type="date" className="form-control" value={editStudent.dob || ""} onChange={(e) => setEditStudent({ ...editStudent, dob: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold text-danger">Aadhaar Card Number *</label>
                  <input type="text" className="form-control font-monospace border-danger" maxLength="12" value={editStudent.aadhaar || ""} onChange={(e) => setEditStudent({ ...editStudent, aadhaar: e.target.value.replace(/[^0-9]/g, '') })} required />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Phone Number *</label>
                  <input type="tel" className="form-control" maxLength="10" value={editStudent.phone || ""} onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value.replace(/[^0-9]/g, '') })} required />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Email Address</label>
                  <input type="email" className="form-control" value={editStudent.email || ""} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold">Highest Qualification</label>
                  <select className="form-select" value={editStudent.qualification || "12th Pass"} onChange={(e) => setEditStudent({ ...editStudent, qualification: e.target.value })}>
                    <option value="10th Pass">10th Matriculation</option><option value="12th Pass">12th Intermediate</option>
                    <option value="Undergraduate">Undergraduate</option><option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option><option value="Other">Other Diploma</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold">Blood Group</label>
                  <select className="form-select" value={editStudent.bloodGroup || "Unknown"} onChange={(e) => setEditStudent({ ...editStudent, bloodGroup: e.target.value })}>
                    <option value="Unknown">Unknown</option><option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option>
                    <option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="col-12 mt-3"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">3. Family Background & Socio-Economic</h6></div>
                <div className="col-md-6">
                  <label className="small fw-bold">Father's Name</label>
                  <input type="text" className="form-control" value={editStudent.fatherName || ""} onChange={(e) => setEditStudent({ ...editStudent, fatherName: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold">Father's Occupation</label>
                  <input type="text" className="form-control" value={editStudent.fatherOccupation || ""} onChange={(e) => setEditStudent({ ...editStudent, fatherOccupation: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold">Mother's Name</label>
                  <input type="text" className="form-control" value={editStudent.motherName || ""} onChange={(e) => setEditStudent({ ...editStudent, motherName: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold">Annual Family Income</label>
                  <select className="form-select" value={editStudent.familyIncome || "Below 1 Lakh"} onChange={(e) => setEditStudent({ ...editStudent, familyIncome: e.target.value })}>
                    <option value="Below 1 Lakh">Below ₹1,00,000</option><option value="1 Lakh - 2.5 Lakhs">₹1,00,000 - ₹2,50,000</option>
                    <option value="2.5 Lakhs - 5 Lakhs">₹2,50,000 - ₹5,00,000</option><option value="Above 5 Lakhs">Above ₹5,00,000</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="small fw-bold">Permanent Address</label>
                  <textarea className="form-control" rows="2" value={editStudent.address || ""} onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })}></textarea>
                </div>

                <div className="col-12 mt-4 text-end border-top pt-3">
                  <button type="button" className="btn btn-light me-2 px-4 rounded-pill" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning px-5 fw-bold rounded-pill shadow-sm">Save All Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPONSE SHEET MODAL */}
      {viewPaperStudent && (() => {
        const stats = calculateScore(viewPaperStudent.paper, viewPaperStudent.student);
        return (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 10000, overflowY: 'auto', padding: '20px 10px' }}>
            <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden' }}>
              <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white border-bottom">
                <h5 className="mb-0 fw-bold">Candidate Exam Response Sheet</h5>
                <div className="d-flex gap-2">
                  <button className="btn btn-success btn-sm rounded-pill px-3 fw-bold" onClick={handlePrint}><i className="fas fa-print me-1"></i> Print PDF</button>
                  <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold" onClick={() => setViewPaperStudent(null)}>✕ Close</button>
                </div>
              </div>
              <div id="printableResponseContent" className="p-4" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                <div className="text-center mb-4 pb-2 border-bottom">
                  <h3 style={{ fontWeight: '900', color: '#0000FF', margin: 0 }}>CYNTAX CODING HUB & IT INSTITUTE</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Candidate Assessment Sheet</p>
                </div>
                <div className="card-header-box" style={{ border: '2px solid #0000FF', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', marginBottom: '25px' }}>
                  <div className="row g-2">
                    <div className="col-sm-6"><span className="text-muted small d-block">Candidate:</span><strong className="fs-6 text-primary">{viewPaperStudent.student.name}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Roll No:</span><strong className="fs-6 font-monospace">{viewPaperStudent.student.studentId}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Course:</span><strong>{viewPaperStudent.student.course}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Date:</span><strong>{viewPaperStudent.paper?.submittedAt || viewPaperStudent.student.testDate || 'Recorded'}</strong></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Score:</span><span className={`badge ${stats.grade === 'Fail' ? 'bg-danger' : 'bg-success'} fs-6`}>{stats.correct} / {stats.total}</span></div>
                    <div className="col-sm-6"><span className="text-muted small d-block">Grade:</span><span className={`badge ${stats.grade === 'Fail' ? 'bg-danger' : 'bg-primary'} fs-6`}>{stats.grade}</span></div>
                  </div>
                </div>
                {viewPaperStudent.paper?.responses?.length ? (
                  viewPaperStudent.paper.responses.map((r, qIdx) => {
                    const isAttempted = r.selectedAnswerIndex !== null && r.selectedAnswerIndex !== undefined;
                    const isCorrect = isAttempted && (r.status === 'correct' || Number(r.selectedAnswerIndex) === Number(r.correctAnswerIndex));
                    return (
                      <div key={qIdx} className="question-box" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px', backgroundColor: isCorrect ? '#f0fdf4' : !isAttempted ? '#f8fafc' : '#fef2f2', pageBreakInside: 'avoid' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="fw-bold">Q{r.qIndex}. {r.questionText}</span>
                          <span className={`badge ${isCorrect ? 'bg-success' : !isAttempted ? 'bg-secondary' : 'bg-danger'} ms-2`}>{isCorrect ? 'Correct (+1)' : !isAttempted ? 'Unattempted (0)' : 'Incorrect (0)'}</span>
                        </div>
                        <div className="mt-2 ms-2">
                          {r.options.map((opt, optIdx) => {
                            const isSelected = Number(r.selectedAnswerIndex) === optIdx;
                            const isCorrectOpt = Number(r.correctAnswerIndex) === optIdx;
                            const optClass = isCorrectOpt ? 'opt-correct' : isSelected ? 'opt-wrong' : 'opt-normal';
                            return (
                              <div key={optIdx} className={`opt-row ${optClass}`} style={{ padding: '8px 12px', borderRadius: '6px', marginBottom: '6px' }}>
                                <span><b>{String.fromCharCode(65 + optIdx)}.</b> {opt}</span>
                                <span>{isSelected && <span className="badge bg-dark ms-2">Candidate's Choice</span>}{isCorrectOpt && <span className="badge bg-success ms-2">✓ Correct Answer</span>}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : <div className="alert alert-warning text-center">Detailed Paper Not Found</div>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Certificate Modal */}
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