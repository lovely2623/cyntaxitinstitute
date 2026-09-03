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
      const response = await fetch(`${BASE_URL}/api/students`);
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

  // Batch Filter (2025 onwards)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const years = [];
    for (let yr = currentYear; yr >= startYear; yr--) {
      years.push(yr.toString());
    }
    return years;
  }, []);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter(s => {
      if (selectedYear !== "ALL") {
        const shortYear = selectedYear.slice(-2);
        const matchId = (s.studentId || s.rollNo || s.regNo || "").toUpperCase().includes(`CYN-${shortYear}`) || 
                        (s.studentId || s.rollNo || s.regNo || "").toUpperCase().includes(`CYN${shortYear}`);
        const matchCreated = s.createdAt && new Date(s.createdAt).getFullYear().toString() === selectedYear;
        if (!matchId && !matchCreated) return false;
      }

      if (!term) return true;
      return (
        (s.name && s.name.toLowerCase().includes(term)) ||
        ((s.studentId || s.rollNo || s.regNo) && (s.studentId || s.rollNo || s.regNo).toLowerCase().includes(term)) ||
        (s.phone && String(s.phone).includes(term))
      );
    });
  }, [students, searchTerm, selectedYear]);

  // 🔥 UNIVERSAL DEEP PARSER: Extracts data from root or any nested details object 🔥
  const extractAllStudentData = useCallback((s) => {
    if (!s) return {};
    const d = s.details || s.additionalDetails || {};

    // 1. Clean Date of Birth for <input type="date"> (Strict YYYY-MM-DD)
    let formattedDob = "";
    const rawDob = s.dob || d.dob || "";
    if (rawDob) {
      if (rawDob.includes("T")) {
        formattedDob = rawDob.split("T")[0];
      } else if (rawDob.includes("-") && rawDob.split("-")[0].length === 4) {
        formattedDob = rawDob;
      } else if (rawDob.includes("/")) {
        const parts = rawDob.split("/");
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            formattedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else if (parts[0].length === 4) {
            formattedDob = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
        }
      } else {
        formattedDob = rawDob;
      }
    }

    // 2. Comprehensive Aadhaar Extraction
    const aadhaarVal = (
      s.aadhaar || s.adaharNumber || s.adharNumber || s.aadharNumber || s.aadhaarNumber || s.aadhar || s.adhar || s.adahar ||
      d.aadhaar || d.adaharNumber || d.adharNumber || d.aadharNumber || d.aadhaarNumber || d.aadhar || d.adhar || d.adahar || ""
    ).toString().trim();

    // 3. Email Extraction
    const emailVal = (s.email || d.email || "").toString().trim();

    // 4. Father Details
    const fatherOccupationVal = (s.fatherOccupation || d.fatherOccupation || "").toString().trim();
    const fatherNameVal = (s.fatherName || d.fatherName || "").toString().trim();
    const motherNameVal = (s.motherName || d.motherName || "").toString().trim();

    // 5. Socio-Economic & Academic Details
    const incomeVal = (s.familyIncome || d.familyIncome || "Below 1 Lakh").toString().trim();
    const qualVal = (s.qualification || d.qualification || "12th Pass").toString().trim();
    const bloodVal = (s.bloodGroup || d.bloodGroup || "Unknown").toString().trim();
    const addrVal = (s.address || d.address || "").toString().trim();
    const genderVal = (s.gender || d.gender || "Male").toString().trim();

    const regId = (s.studentId || s.rollNo || s.regNo || "").toString().trim();

    return {
      ...s,
      studentId: regId,
      rollNo: regId,
      regNo: regId,
      name: (s.name || "").toString().trim(),
      gender: genderVal,
      dob: formattedDob,
      phone: (s.phone || "").toString().trim(),
      email: emailVal,
      aadhaar: aadhaarVal,
      adaharNumber: aadhaarVal,
      adharNumber: aadhaarVal,
      aadharNumber: aadhaarVal,
      fatherName: fatherNameVal,
      fatherOccupation: fatherOccupationVal,
      motherName: motherNameVal,
      familyIncome: incomeVal,
      qualification: qualVal,
      bloodGroup: bloodVal,
      address: addrVal,
      course: (s.course || "DCA").toString().trim(),
      courseDuration: (s.courseDuration || "6 Months").toString().trim(),
      photo: s.photo || "https://via.placeholder.com/150"
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bhai, pakka delete karna hai? Ye data wapas nahi aayega!")) {
      const originalStudents = [...students];
      const updated = students.filter(s => s._id !== id);
      setStudents(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));

      try {
        const res = await fetch(`${BASE_URL}/api/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } catch (error) {
        setStudents(originalStudents);
        localStorage.setItem(CACHE_KEY, JSON.stringify(originalStudents));
        alert("Delete fail ho gaya!");
      }
    }
  };

  const handleResetTest = async (studentToReset) => {
    if (window.confirm(`Kya aap ${studentToReset.name} ka test RESET karna chahte hain? Purana submit paper aur result delete ho jayega aur bacha dubara test de payega.`)) {
      const { _id, __v, createdAt, updatedAt, ...cleanData } = studentToReset;

      const resetPayload = {
        ...cleanData,
        hasGivenTest: false,
        testScore: 0,
        testGrade: null,
        testDate: null,
        submittedExamPaper: null,
        certificateDetails: {
          ...(studentToReset.certificateDetails || {}),
          hasGivenTest: false,
          testScore: 0
        }
      };

      const updatedList = students.map(s => s._id === studentToReset._id ? { ...s, ...resetPayload, _id: studentToReset._id } : s);
      setStudents(updatedList);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
      localStorage.removeItem(`cyntax_test_done_${studentToReset.studentId}`);

      try {
        const res = await fetch(`${BASE_URL}/api/students/${studentToReset._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resetPayload)
        });

        if (res.ok) {
          alert(`${studentToReset.name} ka test aur response paper reset ho gaya! Status ab 'Pending' hai.`);
        } else {
          fetchStudents();
          alert("Reset server sync fail hua!");
        }
      } catch (err) {
        console.error("Reset error:", err);
        fetchStudents();
        alert("Server error aayi hai reset ke time.");
      }
    }
  };

  // 🔥 Complete Dynamic Update Handler 🔥
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { _id, __v, createdAt, updatedAt, ...cleanUpdateData } = editStudent;
    const targetId = _id;

    const targetRegId = (editStudent.studentId || "").trim().toUpperCase();
    const aadhaarVal = (editStudent.aadhaar || editStudent.adaharNumber || editStudent.adharNumber || "").trim();

    const fullPayload = {
      ...cleanUpdateData,
      studentId: targetRegId,
      rollNo: targetRegId,
      regNo: targetRegId,
      name: editStudent.name.trim(),
      gender: editStudent.gender || "Male",
      dob: editStudent.dob,
      phone: editStudent.phone.trim(),
      email: editStudent.email.trim(),
      aadhaar: aadhaarVal,
      adaharNumber: aadhaarVal,
      adharNumber: aadhaarVal,
      aadharNumber: aadhaarVal,
      aadhaarNumber: aadhaarVal,
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
        aadhaar: aadhaarVal,
        adaharNumber: aadhaarVal,
        adharNumber: aadhaarVal,
        fatherOccupation: editStudent.fatherOccupation.trim(),
        familyIncome: editStudent.familyIncome,
        qualification: editStudent.qualification,
        bloodGroup: editStudent.bloodGroup,
        address: editStudent.address.trim(),
        email: editStudent.email.trim(),
        gender: editStudent.gender
      }
    };

    const updatedList = students.map(s => s._id === targetId ? { ...s, ...fullPayload, _id: targetId } : s);
    setStudents(updatedList);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
    setEditStudent(null);

    try {
      const res = await fetch(`${BASE_URL}/api/students/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      if (!res.ok) throw new Error();
      alert("Student ka poora record successfully update ho gaya!");
    } catch (error) {
      alert("Update fail hua! Purana record restore kiya ja raha hai.");
      fetchStudents();
    }
  };

  const isStudentTestDone = (s) => {
    return (
      s.hasGivenTest === true ||
      s.hasGivenTest === "yes" ||
      s.hasGivenTest === "true" ||
      s.certificateDetails?.hasGivenTest === true ||
      !!localStorage.getItem(`cyntax_test_done_${s.studentId}`)
    );
  };

  const getExamPaper = (s) => {
    if (s.submittedExamPaper && s.submittedExamPaper.responses) {
      return s.submittedExamPaper;
    }
    const local = localStorage.getItem(`cyntax_test_done_${s.studentId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.paperSnapshot) return parsed.paperSnapshot;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  };

  const calculateAccurateStats = (paper, studentRecord) => {
    if (paper && Array.isArray(paper.responses) && paper.responses.length > 0) {
      const total = paper.responses.length;
      let correct = 0;

      paper.responses.forEach(r => {
        const isAttempted = r.selectedAnswerIndex !== null && r.selectedAnswerIndex !== undefined;
        if (isAttempted && (r.status === 'correct' || Number(r.selectedAnswerIndex) === Number(r.correctAnswerIndex))) {
          correct += 1;
        }
      });

      const percentage = (correct / total) * 100;
      let grade = "Fail";
      if (percentage >= 80) grade = "A++";
      else if (percentage >= 65) grade = "A+";
      else if (percentage >= 50) grade = "A";
      else if (percentage >= 35) grade = "B";
      else grade = "Fail";

      return { total, correct, grade };
    }

    const fallbackScore = Number(studentRecord?.testScore) || 0;
    const fallbackTotal = paper?.totalQuestions || 2;
    const fallbackPct = (fallbackScore / fallbackTotal) * 100;
    let fallbackGrade = studentRecord?.testGrade || "Fail";
    if (fallbackPct >= 80) fallbackGrade = "A++";
    else if (fallbackPct >= 65) fallbackGrade = "A+";
    else if (fallbackPct >= 50) fallbackGrade = "A";
    else if (fallbackPct >= 35) fallbackGrade = "B";
    else fallbackGrade = "Fail";

    return { total: fallbackTotal, correct: fallbackScore, grade: fallbackGrade };
  };

  const handlePrintResponsePaper = () => {
    const printArea = document.getElementById('printableResponseContent');
    if (!printArea) {
      alert("Print content not found!");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert("Pop-up blocked! Browser pop-up allow karein print karne ke liye.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exam_Response_${viewPaperStudent?.student?.studentId || 'Paper'}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; background: #fff; }
            .card-header-box { border: 2px solid #0000FF; border-radius: 10px; padding: 15px; background-color: #f8fafc; margin-bottom: 20px; }
            .question-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 14px; page-break-inside: avoid; }
            .opt-row { padding: 6px 12px; border-radius: 6px; margin-bottom: 5px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
            .opt-correct { background-color: #dcfce7 !important; border: 1px solid #16a34a !important; color: #15803d !important; font-weight: bold; }
            .opt-wrong { background-color: #fee2e2 !important; border: 1px solid #dc2626 !important; color: #b91c1c !important; font-weight: bold; }
            .opt-normal { background-color: #ffffff; border: 1px solid #e2e8f0; color: #334155; }
            @media print {
              body { padding: 10px; }
              @page { margin: 12mm; }
            }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 450);
  };

  return (
    <div className={`container-fluid mt-4 fade-in pb-5 ${certStudent ? 'p-0' : ''}`}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden no-print">
        
        {/* Card Header */}
        <div className="card-header bg-dark py-3 px-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <h4 className="text-white mb-0 fw-bold">Student Database</h4>
              {isSyncing && (
                <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                  <i className="fas fa-sync-alt fa-spin me-1"></i> Syncing...
                </span>
              )}
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="d-flex align-items-center bg-secondary bg-opacity-25 rounded-3 px-2 py-1">
                <i className="far fa-calendar-alt text-warning me-2"></i>
                <select 
                  className="form-select form-select-sm border-0 bg-transparent text-white fw-bold shadow-none"
                  style={{ width: 'auto', cursor: 'pointer' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="ALL" className="text-dark">All Batches</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr} className="text-dark">
                      {yr} Batch
                    </option>
                  ))}
                </select>
              </div>

              <div className="position-relative" style={{ minWidth: '260px' }}>
                <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 border-0 text-white"
                  placeholder="Search name, roll no..."
                  style={{ backgroundColor: '#2c3e50', borderRadius: '8px', height: '36px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="btn btn-warning btn-sm rounded-pill px-3 fw-bold" onClick={fetchStudents}>
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
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
                filteredStudents.map((s) => {
                  const testDone = isStudentTestDone(s);
                  const paper = getExamPaper(s);
                  const stats = calculateAccurateStats(paper, s);

                  return (
                    <tr key={s._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <img src={s.photo || 'https://via.placeholder.com/45'} alt="" className="rounded-circle border me-3" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                          <div>
                            <div className="fw-bold">{s.name}</div>
                            <small className="text-muted">{s.phone}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-info text-dark">{s.course}</span></td>
                      <td className="font-monospace text-primary fw-bold small">{s.studentId || s.rollNo || s.regNo}</td>

                      <td>
                        {testDone ? (
                          <div>
                            <span className="badge bg-success text-white px-2 py-1">
                              <i className="fas fa-check-circle me-1"></i> Done
                            </span>
                            <div className="small fw-bold text-dark mt-1">
                              {stats.correct}/{stats.total} ({stats.grade})
                            </div>
                          </div>
                        ) : (
                          <span className="badge bg-warning text-dark px-2 py-1">
                            <i className="fas fa-clock me-1"></i> Pending
                          </span>
                        )}
                      </td>

                      <td>
                        {testDone ? (
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                            onClick={() => setViewPaperStudent({ student: s, paper: paper })}
                          >
                            <i className="fas fa-file-alt me-1"></i> View Paper
                          </button>
                        ) : (
                          <span className="text-muted small">No Paper</span>
                        )}
                      </td>

                      <td>
                        {testDone ? (
                          <button 
                            className="btn btn-sm btn-outline-danger rounded-pill fw-bold"
                            onClick={() => handleResetTest(s)}
                            title="Re-attempt test allow karein & paper clear karein"
                          >
                            <i className="fas fa-redo-alt me-1"></i> Reset
                          </button>
                        ) : (
                          <span className="text-muted small">Not required</span>
                        )}
                      </td>

                      <td>
                        {s.isCertificateIssued ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3" style={{ cursor: 'pointer' }} onClick={() => setCertStudent(s)}>
                            <i className="fas fa-check-circle me-1"></i> Yes (View)
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3">
                            <i className="fas fa-times-circle me-1"></i> No
                          </span>
                        )}
                      </td>
                      <td className="text-center pe-4">
                        <div className="btn-group">
                          {/* 1. VIEW BUTTON: DEEP PARSED */}
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            title="View Full Biodata" 
                            onClick={() => setSelectedStudent(extractAllStudentData(s))}
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          {/* 2. EDIT BUTTON: FULLY PRE-FILLED & EDITABLE */}
                          <button 
                            className="btn btn-sm btn-outline-warning" 
                            title="Edit All Details" 
                            onClick={() => setEditStudent(extractAllStudentData(s))}
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}><i className="fas fa-trash"></i></button>
                          <button className="btn btn-sm btn-outline-dark" onClick={() => setCertStudent(s)}><i className="fas fa-certificate text-dark"></i></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {selectedYear !== "ALL" ? `${selectedYear} Batch ka koi record nahi mila.` : "Koi student record nahi mila."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANDIDATE RESPONSE SHEET MODAL */}
      {viewPaperStudent && (() => {
        const stats = calculateAccurateStats(viewPaperStudent.paper, viewPaperStudent.student);

        return (
          <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 10000,
            overflowY: 'auto', padding: '20px 10px'
          }}>
            <div style={{
              maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff',
              borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
              <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white border-bottom">
                <div>
                  <h5 className="mb-0 fw-bold">Candidate Exam Response Sheet</h5>
                  <small className="text-white-50">Cyntax IT Institute &bull; Official Submission Copy</small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                    onClick={handlePrintResponsePaper}
                  >
                    <i className="fas fa-print me-1"></i> Print / Save as PDF
                  </button>
                  <button
                    className="btn btn-light btn-sm rounded-pill px-3 fw-bold"
                    onClick={() => setViewPaperStudent(null)}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              <div id="printableResponseContent" className="p-4" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                <div className="text-center mb-4 pb-2 border-bottom">
                  <h3 style={{ fontWeight: '900', color: '#0000FF', margin: 0, letterSpacing: '0.5px' }}>
                    CYNTAX CODING HUB & IT INSTITUTE
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Official Examination Candidate Assessment Sheet
                  </p>
                </div>

                <div className="card-header-box" style={{
                  border: '2px solid #0000FF', borderRadius: '12px', padding: '16px',
                  backgroundColor: '#f8fafc', marginBottom: '25px'
                }}>
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Candidate Name:</span>
                      <strong className="fs-6 text-primary">{viewPaperStudent.student.name}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Roll Number / Reg ID:</span>
                      <strong className="fs-6 font-monospace">{viewPaperStudent.student.studentId}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Course:</span>
                      <strong>{viewPaperStudent.student.course}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Submission Time:</span>
                      <strong>{viewPaperStudent.paper?.submittedAt || viewPaperStudent.student.testDate || 'Recorded'}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Total Score:</span>
                      <span className={`badge ${stats.grade === 'Fail' ? 'bg-danger' : 'bg-success'} fs-6`}>
                        {stats.correct} / {stats.total}
                      </span>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Final Grade:</span>
                      <span className={`badge ${stats.grade === 'Fail' ? 'bg-danger' : 'bg-primary'} fs-6`}>
                        {stats.grade}
                      </span>
                    </div>
                  </div>
                </div>

                {viewPaperStudent.paper && viewPaperStudent.paper.responses && viewPaperStudent.paper.responses.length > 0 ? (
                  <div>
                    <h6 className="fw-bold border-bottom pb-2 mb-3 text-secondary">
                      EXAMINATION QUESTIONS & CANDIDATE ANSWERS
                    </h6>

                    {viewPaperStudent.paper.responses.map((r, qIdx) => {
                      const isAttempted = r.selectedAnswerIndex !== null && r.selectedAnswerIndex !== undefined;
                      const isCorrect = isAttempted && (r.status === 'correct' || Number(r.selectedAnswerIndex) === Number(r.correctAnswerIndex));
                      const isUnattempted = !isAttempted;

                      return (
                        <div
                          key={qIdx}
                          className="question-box"
                          style={{
                            border: '1px solid #e2e8f0', borderRadius: '10px',
                            padding: '14px', marginBottom: '16px',
                            backgroundColor: isCorrect ? '#f0fdf4' : isUnattempted ? '#f8fafc' : '#fef2f2',
                            pageBreakInside: 'avoid'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="fw-bold" style={{ color: '#0f172a' }}>
                              Q{r.qIndex}. {r.questionText}
                            </span>
                            <span className={`badge ${isCorrect ? 'bg-success' : isUnattempted ? 'bg-secondary' : 'bg-danger'} ms-2`}>
                              {isCorrect ? 'Correct (+1)' : isUnattempted ? 'Unattempted (0)' : 'Incorrect (0)'}
                            </span>
                          </div>

                          <div className="mt-2 ms-2">
                            {r.options.map((opt, optIdx) => {
                              const isSelected = Number(r.selectedAnswerIndex) === optIdx;
                              const isCorrectOpt = Number(r.correctAnswerIndex) === optIdx;

                              let optClass = 'opt-normal';
                              if (isCorrectOpt) optClass = 'opt-correct';
                              if (isSelected && !isCorrectOpt) optClass = 'opt-wrong';

                              return (
                                <div
                                  key={optIdx}
                                  className={`opt-row ${optClass}`}
                                  style={{
                                    padding: '8px 12px', borderRadius: '6px',
                                    marginBottom: '6px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'space-between'
                                  }}
                                >
                                  <span>
                                    <b>{String.fromCharCode(65 + optIdx)}.</b> {opt}
                                  </span>
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
                    })}
                  </div>
                ) : (
                  <div className="alert alert-warning text-center my-4">
                    <h5>⚠️ Detailed Response Sheet Not Found</h5>
                    <p className="mb-0 small">
                      Ye test pehle submit hua tha. Naye test submit hone par complete paper yahan visible hoga.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Certificate Modal */}
      {certStudent && (
        <div className="modal-overlay no-print-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, overflowY: 'auto' }}>
          <div className="modal-content-custom bg-white p-0 mx-auto" style={{ maxWidth: '98%', width: '1250px', borderRadius: '15px', position: 'relative', top: '160px' }}>
            <div className="no-print d-flex justify-content-between align-items-center p-3 border-bottom bg-dark text-white rounded-top-4">
              <h5 className="mb-0 fw-bold">Certificate Portal</h5>
              <button className="btn-close btn-close-white" onClick={() => setCertStudent(null)}></button>
            </div>
            <Certificate preFillData={certStudent} onSuccess={() => { fetchStudents(); setCertStudent(null); }} />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. VIEW MODAL: ALL ADMISSION FIELDS SHOWN (DEEP RESOLVED)      */}
      {/* ============================================================== */}
      {selectedStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', padding: '20px 10px' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom p-0 shadow-lg bg-white" style={{ maxWidth: '900px', width: '95%', borderRadius: '18px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            
            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold"><i className="fas fa-id-card me-2"></i> Student Complete Bio-Data & Admission Record</h5>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>

            <div className="p-4" style={{ overflowY: 'auto' }}>
              <div className="row g-4">
                
                {/* Photo & Core Badge */}
                <div className="col-md-3 text-center border-end">
                  <img 
                    src={selectedStudent.photo || 'https://via.placeholder.com/150'} 
                    className="img-fluid rounded-4 shadow-sm mb-3" 
                    style={{ border: '3px solid #0000FF', width: '140px', height: '140px', objectFit: 'cover' }} 
                    alt="Student" 
                  />
                  <h5 className="fw-bold text-dark mb-1">{selectedStudent.name}</h5>
                  <span className="badge bg-dark font-monospace mb-2">{selectedStudent.studentId}</span>
                  <div><span className="badge bg-info text-dark">{selectedStudent.course}</span></div>
                  <small className="text-muted d-block mt-1">Duration: {selectedStudent.courseDuration || "6 Months"}</small>
                </div>

                {/* All Sections */}
                <div className="col-md-9">
                  
                  {/* Section 1: Personal & Identity */}
                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">1. Personal & Identity Details</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6"><small className="text-muted d-block">Gender</small><strong>{selectedStudent.gender || "Male"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Date of Birth</small><strong>{selectedStudent.dob || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Mobile Number</small><strong>{selectedStudent.phone}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Email Address</small><strong>{selectedStudent.email || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Aadhaar Card Number</small><strong className="text-danger font-monospace">{selectedStudent.aadhaar || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Blood Group</small><strong>{selectedStudent.bloodGroup || "Unknown"}</strong></div>
                    <div className="col-sm-12"><small className="text-muted d-block">Highest Qualification</small><strong>{selectedStudent.qualification || "12th Pass"}</strong></div>
                  </div>

                  {/* Section 2: Family & Socio-Economic */}
                  <h6 className="fw-bold text-primary border-bottom pb-1 mb-2">2. Family Background & Occupation</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6"><small className="text-muted d-block">Father's Name</small><strong>{selectedStudent.fatherName || "N/A"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Father's Occupation</small><strong>{selectedStudent.fatherOccupation || "Not Provided"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Mother's Name</small><strong>{selectedStudent.motherName || "N/A"}</strong></div>
                    <div className="col-sm-6"><small className="text-muted d-block">Annual Family Income</small><strong className="text-success">{selectedStudent.familyIncome || "Below 1 Lakh"}</strong></div>
                    <div className="col-sm-12"><small className="text-muted d-block">Permanent Address</small><strong>{selectedStudent.address || "Not Provided"}</strong></div>
                  </div>

                  {/* Section 3: Assessment Result */}
                  {isStudentTestDone(selectedStudent) && (
                    <div className="p-3 bg-light rounded-3 border mt-2">
                      <small className="text-muted d-block fw-bold text-uppercase">Examination Result</small>
                      <strong className="text-success fs-6">
                        Score: {selectedStudent.testScore ?? 0} Marks | Grade: {selectedStudent.testGrade || 'A'} | Date: {selectedStudent.testDate || 'Completed'}
                      </strong>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="p-3 bg-light border-top text-end">
              <button className="btn btn-secondary btn-sm px-4 rounded-pill" onClick={() => setSelectedStudent(null)}>Close</button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EDIT MODAL: PRE-FILLED DOB & ALL FIELDS EDITABLE            */}
      {/* ============================================================== */}
      {editStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', overflowY: 'auto', padding: '20px 10px' }}>
          <div className="modal-content-custom p-4 bg-white shadow-lg" style={{ maxWidth: '950px', width: '95%', borderRadius: '18px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <div>
                <h4 className="fw-bold text-warning mb-0"><i className="fas fa-user-edit me-2"></i> Update Complete Student Record</h4>
                <small className="text-muted">Editing: <strong className="text-dark">{editStudent.name}</strong></small>
              </div>
              <button className="btn-close" onClick={() => setEditStudent(null)}></button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                
                {/* 1. Academic Information */}
                <div className="col-12"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">1. Academic & Registration Details</h6></div>
                
                <div className="col-md-4">
                  <label className="small fw-bold text-dark">Registration ID * (Custom Editable)</label>
                  <input 
                    type="text" 
                    className="form-control font-monospace fw-bold text-primary" 
                    value={editStudent.studentId || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value.toUpperCase() })} 
                    required 
                  />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Course Enrolled *</label>
                  <select 
                    className="form-select" 
                    value={editStudent.course || "DCA"} 
                    onChange={(e) => setEditStudent({ ...editStudent, course: e.target.value })}
                  >
                    <option value="DCA">DCA</option>
                    <option value="ADCA">ADCA</option>
                    <option value="Steno">Stenography & Shorthand</option>
                    <option value="Short Term">Short Term / Web Dev</option>
                    <option value="Tally">Tally Prime & Accounting</option>
                    <option value="Basic">Basic Computer</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Course Duration</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editStudent.courseDuration || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, courseDuration: e.target.value })} 
                  />
                </div>

                {/* 2. Personal & Identity Details */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">2. Personal & Identity Details</h6></div>
                
                <div className="col-md-4">
                  <label className="small fw-bold">Student Full Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editStudent.name || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} 
                    required 
                  />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Gender</label>
                  <select 
                    className="form-select" 
                    value={editStudent.gender || "Male"} 
                    onChange={(e) => setEditStudent({ ...editStudent, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* PRE-FILLED DATE OF BIRTH */}
                <div className="col-md-4">
                  <label className="small fw-bold">Date of Birth (Password) *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={editStudent.dob || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, dob: e.target.value })} 
                    required 
                  />
                </div>

                {/* PRE-FILLED AADHAAR */}
                <div className="col-md-4">
                  <label className="small fw-bold text-danger">Aadhaar Card Number *</label>
                  <input 
                    type="text" 
                    className="form-control font-monospace border-danger" 
                    maxLength="12" 
                    value={editStudent.aadhaar || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, aadhaar: e.target.value.replace(/[^0-9]/g, '') })} 
                    required 
                  />
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Mobile Phone Number *</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    maxLength="10" 
                    value={editStudent.phone || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value.replace(/[^0-9]/g, '') })} 
                    required 
                  />
                </div>

                {/* PRE-FILLED EMAIL */}
                <div className="col-md-4">
                  <label className="small fw-bold">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={editStudent.email || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} 
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold">Highest Qualification</label>
                  <select 
                    className="form-select" 
                    value={editStudent.qualification || "12th Pass"} 
                    onChange={(e) => setEditStudent({ ...editStudent, qualification: e.target.value })}
                  >
                    <option value="10th Pass">10th Matriculation</option>
                    <option value="12th Pass">12th Intermediate</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate (BA, BSc, BCom, BCA, BTech)</option>
                    <option value="Postgraduate">Postgraduate (MCA, MA, MSc)</option>
                    <option value="Other">Other Diploma</option>
                  </select>
                </div>

                {/* PRE-FILLED BLOOD GROUP */}
                <div className="col-md-6">
                  <label className="small fw-bold">Blood Group</label>
                  <select 
                    className="form-select" 
                    value={editStudent.bloodGroup || "Unknown"} 
                    onChange={(e) => setEditStudent({ ...editStudent, bloodGroup: e.target.value })}
                  >
                    <option value="Unknown">Don't Know / NA</option>
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

                {/* 3. Family Background & Socio-Economic */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">3. Family Background & Occupation</h6></div>
                
                <div className="col-md-6">
                  <label className="small fw-bold">Father's Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editStudent.fatherName || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, fatherName: e.target.value })} 
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold">Father's Occupation</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editStudent.fatherOccupation || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, fatherOccupation: e.target.value })} 
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold">Mother's Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editStudent.motherName || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, motherName: e.target.value })} 
                  />
                </div>

                <div className="col-md-6">
                  <label className="small fw-bold">Annual Family Income</label>
                  <select 
                    className="form-select" 
                    value={editStudent.familyIncome || "Below 1 Lakh"} 
                    onChange={(e) => setEditStudent({ ...editStudent, familyIncome: e.target.value })}
                  >
                    <option value="Below 1 Lakh">Below ₹1,00,000 / annum</option>
                    <option value="1 Lakh - 2.5 Lakhs">₹1,00,000 - ₹2,50,000 / annum</option>
                    <option value="2.5 Lakhs - 5 Lakhs">₹2,50,000 - ₹5,00,000 / annum</option>
                    <option value="Above 5 Lakhs">Above ₹5,00,000 / annum</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="small fw-bold">Permanent Address</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    value={editStudent.address || ""} 
                    onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })}
                  ></textarea>
                </div>

                {/* 4. Test Status */}
                <div className="col-12 mt-4"><h6 className="fw-bold text-primary border-bottom pb-1 mb-2">4. Examination Status Override</h6></div>
                <div className="col-md-4">
                  <label className="small fw-bold">Test Status</label>
                  <select 
                    className="form-select" 
                    value={isStudentTestDone(editStudent) ? "yes" : "no"} 
                    onChange={(e) => setEditStudent({ ...editStudent, hasGivenTest: e.target.value === "yes" })}
                  >
                    <option value="no">Allow Test (Pending)</option>
                    <option value="yes">Block Test (Done)</option>
                  </select>
                </div>

                {/* Controls */}
                <div className="col-12 mt-4 text-end border-top pt-3">
                  <button type="button" className="btn btn-light me-2 px-4 rounded-pill" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning px-5 fw-bold rounded-pill shadow-sm">Save All Changes</button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentList;