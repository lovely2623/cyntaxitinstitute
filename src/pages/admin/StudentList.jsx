import React, { useState, useEffect, useCallback } from 'react';
import '../admin/AdminLayout.css';
import Certificate from './Certificate'; // Path check kar lena apne hisab se

function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [certStudent, setCertStudent] = useState(null); // Certificate popup ke liye
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('https://cyntaxitinstitute.onrender.com/api/students', {
        cache: 'no-cache'
      });
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  }, []);

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
        const res = await fetch(`https://cyntaxitinstitute.onrender.com/api/students/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
      } catch (error) {
        setStudents(originalStudents);
        alert("Delete fail ho gaya!");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedData = editStudent;
    setStudents(prev => prev.map(s => s._id === updatedData._id ? updatedData : s));
    setEditStudent(null);
    try {
      await fetch(`https://cyntaxitinstitute.onrender.com/api/students/${updatedData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (error) {
      alert("Update fail!");
      fetchStudents();
    }
  };

  if (loading) return <div className="text-center p-5"><h4>🔄 Loading Cyntax Records...</h4></div>;

  return (
    <div className="container-fluid mt-4 fade-in pb-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-dark py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <h4 className="text-white mb-3 mb-md-0 fw-bold">Student List</h4>
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
                <th>Issued Cert.</th> {/* Naya Column */}
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
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
                  
                  {/* --- ISSUED CERTIFICATE STATUS --- */}
                  <td>
                    {s.isCertificateIssued ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 cursor-pointer" onClick={() => setCertStudent(s)}>
                        <i className="fas fa-check-circle me-1"></i> Yes
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3">
                        <i className="fas fa-times-circle me-1"></i> No
                      </span>
                    )}
                  </td>

                  <td className="text-center pe-4">
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedStudent(s)} title="View Profile"><i className="fas fa-eye"></i></button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => setEditStudent(s)} title="Edit Info"><i className="fas fa-edit"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)} title="Delete"><i className="fas fa-trash"></i></button>
                      
                      {/* --- CERTIFICATE BUTTON --- */}
                      <button className="btn btn-sm btn-outline-dark" onClick={() => setCertStudent(s)} title="Certificate">
                        <i className="fas fa-certificate text-dark"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 🎓 CERTIFICATE POPUP --- */}
      {certStudent && (
        <div className="modal-overlay" style={{ paddingTop: '100px', alignItems: 'flex-start', zIndex: 1050 }}>
          <div className="modal-content-custom bg-white animate__animated animate__zoomIn p-0" style={{ maxWidth: '90%', width: '1200px', borderRadius: '15px' }}>
            <div className="no-print d-flex justify-content-between align-items-center p-3 border-bottom bg-dark text-white rounded-top-4">
              <h5 className="mb-0 fw-bold">Certificate Management</h5>
              <button className="btn-close btn-close-white" onClick={() => setCertStudent(null)}></button>
            </div>
            <div className="p-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <Certificate 
                preFillData={certStudent} 
                onSuccess={() => {
                  fetchStudents(); // Sync data after issuance
                  setCertStudent(null);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {selectedStudent && (
        <div className="modal-overlay" style={{ paddingTop: '100px', alignItems: 'flex-start' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom animate__animated animate__fadeInDown p-0 shadow-lg" style={{ maxWidth: '700px', borderRadius: '15px' }} onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Full Student Profile</h5>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="p-4 bg-white">
              <div className="row">
                <div className="col-md-4 text-center border-end">
                  <img src={selectedStudent.photo || 'https://via.placeholder.com/150'} className="img-fluid rounded shadow-sm mb-3" style={{ border: '3px solid #f8f9fa' }} alt="Student" />
                  <h5 className="fw-bold text-dark">{selectedStudent.name}</h5>
                  <span className="badge bg-dark mb-3">{selectedStudent.studentId}</span>
                </div>
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-6"><small className="text-muted d-block">Father's Name</small><strong>{selectedStudent.fatherName}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Mother's Name</small><strong>{selectedStudent.motherName}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Phone Number</small><strong>{selectedStudent.phone}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Aadhaar Number</small><strong>{selectedStudent.aadhaarNumber}</strong></div>
                    <div className="col-6"><small className="text-muted d-block">Date of Birth</small><strong>{selectedStudent.dob}</strong></div>
                    <div className="col-12"><small className="text-muted d-block">Course</small><strong className="text-primary">{selectedStudent.course}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editStudent && (
        <div className="modal-overlay" style={{ paddingTop: '100px', alignItems: 'flex-start' }}>
          <div className="modal-content-custom animate__animated animate__fadeInUp p-4" style={{ maxWidth: '800px', borderRadius: '15px' }}>
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
                  <label className="small fw-bold">Course</label>
                  <select className="form-select" value={editStudent.course} onChange={(e) => setEditStudent({ ...editStudent, course: e.target.value })}>
                    <option value="DCA">DCA</option>
                    <option value="ADCA">ADCA</option>
                    <option value="Steno">Steno</option>
                  </select>
                </div>
                {/* ... existing edit fields ... */}
                <div className="col-12 mt-3 text-end">
                  <button type="button" className="btn btn-light me-2" onClick={() => setEditStudent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning px-4">Save Changes</button>
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