import React, { useState, useEffect, useCallback } from 'react';
import '../admin/AdminLayout.css';
import Certificate from './Certificate';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [certStudent, setCertStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/students`, {
        cache: 'no-cache'
      });
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(s =>
    s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Bhai, pakka delete karna hai? Ye data wapas nahi aayega!")) {
      const originalStudents = [...students];
      setStudents(students.filter(s => s._id !== id));
      try {
        const res = await fetch(`${BASE_URL}/api/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } catch (error) {
        setStudents(originalStudents);
        alert("Delete fail ho gaya!");
      }
    }
  };

  // ONE-CLICK RESET TEST FUNCTION (Database + LocalStorage Sync)
  const handleResetTest = async (studentToReset) => {
    if (window.confirm(`Kya aap ${studentToReset.name} ka test RESET karna chahte hain? Bacha dubara test de payega.`)) {
      // MongoDB immutable fields strip karein
      const { _id, __v, createdAt, updatedAt, ...cleanData } = studentToReset;

      const resetPayload = {
        ...cleanData,
        hasGivenTest: false,
        testScore: 0,
        testGrade: null,
        testDate: null,
        certificateDetails: {
          ...(studentToReset.certificateDetails || {}),
          hasGivenTest: false,
          testScore: 0
        }
      };

      try {
        // Local backup clear karein
        localStorage.removeItem(`cyntax_test_done_${studentToReset.studentId}`);

        const res = await fetch(`${BASE_URL}/api/students/${studentToReset._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resetPayload)
        });

        if (res.ok) {
          alert(`${studentToReset.name} ka test reset ho gaya! Status ab 'Pending' hai.`);
          setStudents(prev => prev.map(s => s._id === studentToReset._id ? { ...s, ...resetPayload, _id: studentToReset._id } : s));
        } else {
          alert("Reset fail hua! Server ne request accept nahi ki.");
        }
      } catch (err) {
        console.error("Reset error:", err);
        alert("Server error aayi hai reset ke time.");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { _id, __v, createdAt, updatedAt, ...cleanUpdateData } = editStudent;

    const originalStudents = [...students];
    setStudents(prev => prev.map(s => s._id === _id ? editStudent : s));
    const targetId = _id;
    setEditStudent(null);

    try {
      const res = await fetch(`${BASE_URL}/api/students/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUpdateData)
      });
      if (!res.ok) throw new Error();
      fetchStudents();
    } catch (error) {
      alert("Update fail!");
      setStudents(originalStudents);
    }
  };

  // Helper check: Test Done ya Pending
  const isStudentTestDone = (s) => {
    return (
      s.hasGivenTest === true ||
      s.hasGivenTest === "yes" ||
      s.hasGivenTest === "true" ||
      s.certificateDetails?.hasGivenTest === true ||
      !!localStorage.getItem(`cyntax_test_done_${s.studentId}`)
    );
  };

  if (loading) return <div className="text-center p-5"><h4>🔄 Loading Cyntax Records...</h4></div>;

  return (
    <div className={`container-fluid mt-4 fade-in pb-5 ${certStudent ? 'p-0' : ''}`}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden no-print">
        <div className="card-header bg-dark py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <h4 className="text-white mb-3 mb-md-0 fw-bold">Student Database</h4>
            <div className="position-relative w-100" style={{ maxWidth: '400px' }}>
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                type="text"
                className="form-control ps-5 border-0 text-white"
                placeholder="Search by name..."
                style={{ backgroundColor: '#2c3e50', borderRadius: '10px', height: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-warning btn-sm rounded-pill px-4 fw-bold ms-md-3 mt-3 mt-md-0" onClick={fetchStudents}>
              <i className="fas fa-sync-alt"></i> Sync
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
                <th>Reset Exam</th>
                <th>Issued Cert.</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const testDone = isStudentTestDone(s);
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

                    {/* TEST STATUS (DONE / PENDING) */}
                    <td>
                      {testDone ? (
                        <div>
                          <span className="badge bg-success text-white px-2 py-1">
                            <i className="fas fa-check-circle me-1"></i> Done
                          </span>
                          <div className="small fw-bold text-dark mt-1">
                            {s.testScore ?? s.certificateDetails?.testScore ?? 0}/50 ({s.testGrade || 'A'})
                          </div>
                        </div>
                      ) : (
                        <span className="badge bg-warning text-dark px-2 py-1">
                          <i className="fas fa-clock me-1"></i> Pending
                        </span>
                      )}
                    </td>

                    {/* RESET BUTTON */}
                    <td>
                      {testDone ? (
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill fw-bold"
                          onClick={() => handleResetTest(s)}
                          title="Re-attempt test allow karein"
                        >
                          <i className="fas fa-redo-alt me-1"></i> Reset
                        </button>
                      ) : (
                        <span className="text-muted small">Not required</span>
                      )}
                    </td>

                    <td>
                      {s.isCertificateIssued ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3" style={{cursor: 'pointer'}} onClick={() => setCertStudent(s)}>
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      {certStudent && (
        <div className="modal-overlay no-print-bg" style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.8)', zIndex: 9999, overflowY:'auto' }}>
          <div className="modal-content-custom bg-white p-0 mx-auto" style={{ maxWidth: '98%', width: '1250px', borderRadius: '15px', position:'relative', top:'160px' }}>
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
        <div className="modal-overlay no-print" style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.7)', zIndex: 1050, display:'flex', justifyContent:'center', alignItems:'center' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom p-0 shadow-lg bg-white" style={{ maxWidth: '700px', width:'90%', borderRadius: '15px', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Full Student Profile</h5>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-md-4 text-center border-end">
                  <img src={selectedStudent.photo || 'https://via.placeholder.com/150'} className="img-fluid rounded shadow-sm mb-3" style={{ border: '3px solid #f8f9fa', width:'150px', height:'150px', objectFit:'cover' }} alt="Student" />
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
                        <strong className="text-success">{selectedStudent.testScore ?? 0} / 50 (Grade: {selectedStudent.testGrade || 'A'}) on {selectedStudent.testDate || 'Completed'}</strong>
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
        <div className="modal-overlay no-print" style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.7)', zIndex: 1050, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div className="modal-content-custom p-4 bg-white shadow-lg" style={{ maxWidth: '850px', width:'95%', borderRadius: '15px', maxHeight: '90vh', overflowY: 'auto' }}>
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