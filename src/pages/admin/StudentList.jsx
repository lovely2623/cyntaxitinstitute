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
  const [viewPaperStudent, setViewPaperStudent] = useState(null); // Response Paper State
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;
    return students.filter(s =>
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.studentId && s.studentId.toLowerCase().includes(term)) ||
      (s.phone && String(s.phone).includes(term))
    );
  }, [students, searchTerm]);

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

  // ONE-CLICK RESET TEST (Clears Test Status AND Exam Response Sheet)
  const handleResetTest = async (studentToReset) => {
    if (window.confirm(`Kya aap ${studentToReset.name} ka test RESET karna chahte hain? Purana submit paper aur result delete ho jayega aur bacha dubara test de payega.`)) {
      const { _id, __v, createdAt, updatedAt, ...cleanData } = studentToReset;

      const resetPayload = {
        ...cleanData,
        hasGivenTest: false,
        testScore: 0,
        testGrade: null,
        testDate: null,
        submittedExamPaper: null, // Clear Response Sheet
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { _id, __v, createdAt, updatedAt, ...cleanUpdateData } = editStudent;
    const targetId = _id;

    const updatedList = students.map(s => s._id === targetId ? editStudent : s);
    setStudents(updatedList);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
    setEditStudent(null);

    try {
      const res = await fetch(`${BASE_URL}/api/students/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUpdateData)
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      alert("Update fail!");
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

  // Helper to retrieve paper snapshot from student or local storage
  const getExamPaper = (s) => {
    if (s.submittedExamPaper && s.submittedExamPaper.responses) {
      return s.submittedExamPaper;
    }
    const local = localStorage.getItem(`cyntax_test_done_${s.studentId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.paperSnapshot) return parsed.paperSnapshot;
      } catch (e) {}
    }
    return null;
  };

  return (
    <div className={`container-fluid mt-4 fade-in pb-5 ${certStudent ? 'p-0' : ''}`}>
      {/* Print Style Fix: White Screen Problem Solver */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-response-paper, .printable-response-paper * {
            visibility: visible !important;
          }
          .printable-response-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .no-print-area {
            display: none !important;
          }
        }
      `}</style>

      <div className="card shadow-lg border-0 rounded-4 overflow-hidden no-print">
        <div className="card-header bg-dark py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <h4 className="text-white mb-0 fw-bold">Student Database</h4>
              {isSyncing && (
                <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                  <i className="fas fa-sync-alt fa-spin me-1"></i> Syncing...
                </span>
              )}
            </div>

            <div className="position-relative w-100 mt-2 mt-md-0" style={{ maxWidth: '400px' }}>
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                type="text"
                className="form-control ps-5 border-0 text-white"
                placeholder="Search by name, roll no, phone..."
                style={{ backgroundColor: '#2c3e50', borderRadius: '10px', height: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="btn btn-warning btn-sm rounded-pill px-4 fw-bold ms-md-3 mt-3 mt-md-0" onClick={fetchStudents}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
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
                  const totalCount = paper?.totalQuestions || (s.testScore !== undefined ? 2 : 0);

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
                      <td className="font-monospace text-muted small">{s.studentId}</td>

                      {/* TEST STATUS (DYNAMIC QUESTIONS COUNT) */}
                      <td>
                        {testDone ? (
                          <div>
                            <span className="badge bg-success text-white px-2 py-1">
                              <i className="fas fa-check-circle me-1"></i> Done
                            </span>
                            <div className="small fw-bold text-dark mt-1">
                              {s.testScore ?? s.certificateDetails?.testScore ?? 0}/{totalCount} ({s.testGrade || paper?.grade || 'C (Fail)'})
                            </div>
                          </div>
                        ) : (
                          <span className="badge bg-warning text-dark px-2 py-1">
                            <i className="fas fa-clock me-1"></i> Pending
                          </span>
                        )}
                      </td>

                      {/* RESPONSE SHEET / VIEW PAPER BUTTON */}
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

                      {/* RESET BUTTON */}
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
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedStudent(s)}><i className="fas fa-eye"></i></button>
                          <button className="btn btn-sm btn-outline-warning" onClick={() => setEditStudent(s)}><i className="fas fa-edit"></i></button>
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
                    Koi student record nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CANDIDATE QUESTION PAPER / RESPONSE SHEET MODAL (WITH PRINT)    */}
      {/* ============================================================== */}
      {viewPaperStudent && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 10000,
          overflowY: 'auto', padding: '20px 10px'
        }}>
          <div className="printable-response-paper" style={{
            maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff',
            borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            {/* Header Toolbar (No-Print) */}
            <div className="no-print-area d-flex justify-content-between align-items-center p-3 bg-dark text-white border-bottom">
              <div>
                <h5 className="mb-0 fw-bold">Candidate Exam Response Sheet</h5>
                <small className="text-white-50">Cyntax IT Institute &bull; Official Submission Copy</small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                  onClick={() => window.print()}
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

            {/* Printable Paper Body */}
            <div className="p-4" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
              {/* Candidate Info Header */}
              <div style={{
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
                    <span className="badge bg-success fs-6">
                      {viewPaperStudent.student.testScore ?? 0} / {viewPaperStudent.paper?.totalQuestions || 2}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Final Grade:</span>
                    <span className="badge bg-primary fs-6">
                      {viewPaperStudent.student.testGrade || viewPaperStudent.paper?.grade || 'C (Fail)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions & Responses List */}
              {viewPaperStudent.paper && viewPaperStudent.paper.responses && viewPaperStudent.paper.responses.length > 0 ? (
                <div>
                  <h6 className="fw-bold border-bottom pb-2 mb-3 text-secondary">
                    EXAMINATION QUESTIONS & CANDIDATE ANSWERS
                  </h6>

                  {viewPaperStudent.paper.responses.map((r, qIdx) => {
                    const isCorrect = r.status === 'correct';
                    const isUnattempted = r.status === 'unattempted';

                    return (
                      <div
                        key={qIdx}
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

                        {/* Options */}
                        <div className="mt-2 ms-2">
                          {r.options.map((opt, optIdx) => {
                            const isSelected = r.selectedAnswerIndex === optIdx;
                            const isCorrectOpt = r.correctAnswerIndex === optIdx;

                            let optBg = '#ffffff';
                            let borderStyle = '1px solid #cbd5e1';
                            let textStyle = '#334155';

                            if (isCorrectOpt) {
                              optBg = '#dcfce7';
                              borderStyle = '2px solid #16a34a';
                              textStyle = '#15803d';
                            }
                            if (isSelected && !isCorrectOpt) {
                              optBg = '#fee2e2';
                              borderStyle = '2px solid #dc2626';
                              textStyle = '#b91c1c';
                            }

                            return (
                              <div
                                key={optIdx}
                                style={{
                                  padding: '8px 12px', borderRadius: '6px',
                                  backgroundColor: optBg, border: borderStyle,
                                  color: textStyle, fontSize: '13px',
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
                    Ye test pichhle version mein submit hua tha jab individual response questions database mein save nahi ho rahe the. Naye submit hone wale har test ka complete paper yahan auto-generate hoga.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* View Modal */}
      {selectedStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom p-0 shadow-lg bg-white" style={{ maxWidth: '700px', width: '90%', borderRadius: '15px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Full Student Profile</h5>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-md-4 text-center border-end">
                  <img src={selectedStudent.photo || 'https://via.placeholder.com/150'} className="img-fluid rounded shadow-sm mb-3" style={{ border: '3px solid #f8f9fa', width: '150px', height: '150px', objectFit: 'cover' }} alt="Student" />
                  <h5 className="fw-bold text-dark">{selectedStudent.name}</h5>
                  <span className="badge bg-dark mb-3">{selectedStudent.studentId}</span>
                </div>
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-6"><small className="text-muted d-block">Father's Name</small><strong>{selectedStudent.fatherName}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Mother's Name</small><strong>{selectedStudent.motherName}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Phone Number</small><strong>{selectedStudent.phone}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Date of Birth</small><strong>{selectedStudent.dob}</strong></div>
                    <div className="col-12"><small className="text-muted d-block">Course</small><strong className="text-primary">{selectedStudent.course}</strong></div>
                    {isStudentTestDone(selectedStudent) && (
                      <div className="col-12 p-2 bg-light rounded">
                        <small className="text-muted d-block">Exam Result</small>
                        <strong className="text-success">{selectedStudent.testScore ?? 0} Marks (Grade: {selectedStudent.testGrade || 'C (Fail)'}) on {selectedStudent.testDate || 'Completed'}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && (
        <div className="modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content-custom p-4 bg-white shadow-lg" style={{ maxWidth: '850px', width: '95%', borderRadius: '15px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
              <h4 className="fw-bold text-warning mb-0">Update Student Data</h4>
              <button className="btn-close" onClick={() => setEditStudent(null)}></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="small fw-bold">Full Name</label>
                  <input type="text" className="form-control" value={editStudent.name} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Father's Name</label>
                  <input type="text" className="form-control" value={editStudent.fatherName} onChange={(e) => setEditStudent({ ...editStudent, fatherName: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Phone Number</label>
                  <input type="text" className="form-control" value={editStudent.phone} onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Date of Birth</label>
                  <input type="date" className="form-control" value={editStudent.dob} onChange={(e) => setEditStudent({ ...editStudent, dob: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Reset Test Attempt</label>
                  <select className="form-select" value={isStudentTestDone(editStudent) ? "yes" : "no"} onChange={(e) => setEditStudent({ ...editStudent, hasGivenTest: e.target.value === "yes" })}>
                    <option value="no">Allow Test (Pending)</option>
                    <option value="yes">Block Test (Done)</option>
                  </select>
                </div>
                <div className="col-12 mt-4 text-end border-top pt-3">
                  <button type="button" className="btn btn-light me-2 px-4" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning px-4 fw-bold">Save Changes</button>
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