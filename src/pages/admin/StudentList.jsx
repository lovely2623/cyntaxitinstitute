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

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('https://cyntaxitinstitute.onrender.com/api/students', { cache: 'no-cache' });
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
    if (window.confirm("Bhai, pakka delete karna hai?")) {
      const originalStudents = [...students];
      setStudents(students.filter(s => s._id !== id));
      try {
        await fetch(`https://cyntaxitinstitute.onrender.com/api/students/${id}`, { method: 'DELETE' });
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
      alert("Database Updated Successfully!");
    } catch (error) {
      alert("Update fail!");
      fetchStudents();
    }
  };

  if (loading) return <div className="text-center p-5"><h4>🔄 Loading Cyntax Records...</h4></div>;

  return (
    <div className="container-fluid mt-4 fade-in pb-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* HEADER */}
        <div className="card-header bg-dark py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <h4 className="text-white mb-3 mb-md-0 fw-bold">Student List</h4>
            <div className="position-relative w-100" style={{ maxWidth: '400px' }}>
              <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                type="text"
                className="form-control ps-5 border-0 text-white shadow-none"
                placeholder="Search by name..."
                style={{ backgroundColor: '#2c3e50', borderRadius: '10px', height: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-warning btn-sm rounded-pill px-4 fw-bold ms-md-3" onClick={fetchStudents}>
              <i className="fas fa-sync-alt"></i> Sync
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase small">
              <tr>
                <th className="ps-4">Student</th>
                <th>Course</th>
                <th>Reg ID</th>
                <th>Issued</th>
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
                  <td><span className="badge bg-info text-dark px-3">{s.course}</span></td>
                  <td className="font-monospace text-muted">{s.studentId}</td>
                  <td>
                    <span className={`badge px-3 ${s.isCertificateIssued ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                      {s.isCertificateIssued ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="text-center pe-4">
                    <div className="btn-group shadow-sm">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedStudent(s)}><i className="fas fa-eye"></i></button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => setEditStudent(s)}><i className="fas fa-edit"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}><i className="fas fa-trash"></i></button>
                      <button className="btn btn-sm btn-outline-dark" onClick={() => setCertStudent(s)}><i className="fas fa-certificate"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 📝 FULL EDIT MODAL (AB SAB KUCH HAI ISME) --- */}
      {editStudent && (
        <div className="modal-overlay" style={{ paddingTop: '90px', alignItems: 'flex-start', overflowY: 'auto' }}>
          <div className="modal-content-custom animate__animated animate__fadeInUp p-4" style={{ maxWidth: '850px', borderRadius: '15px' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
              <h4 className="fw-bold text-dark mb-0">Update Admission Info</h4>
              <button className="btn-close" onClick={() => setEditStudent(null)}></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="small fw-bold">Student Name</label>
                  <input type="text" className="form-control" value={editStudent.name} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Father's Name</label>
                  <input type="text" className="form-control" value={editStudent.fatherName} onChange={(e) => setEditStudent({ ...editStudent, fatherName: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Mother's Name</label>
                  <input type="text" className="form-control" value={editStudent.motherName} onChange={(e) => setEditStudent({ ...editStudent, motherName: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Aadhaar Number</label>
                  <input type="text" className="form-control" value={editStudent.aadhaarNumber} onChange={(e) => setEditStudent({ ...editStudent, aadhaarNumber: e.target.value })} />
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
                  <label className="small fw-bold">Course</label>
                  <select className="form-select" value={editStudent.course} onChange={(e) => setEditStudent({ ...editStudent, course: e.target.value })}>
                    <option value="DCA">DCA</option>
                    <option value="ADCA">ADCA</option>
                    <option value="Steno">Steno</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Duration</label>
                  <input type="text" className="form-control" value={editStudent.courseDuration} onChange={(e) => setEditStudent({ ...editStudent, courseDuration: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold">Status</label>
                  <select className="form-select" value={editStudent.status} onChange={(e) => setEditStudent({ ...editStudent, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="small fw-bold">Full Address</label>
                  <textarea className="form-control" rows="2" value={editStudent.address} onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="button" className="btn btn-light me-2 rounded-pill px-4" onClick={() => setEditStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-dark rounded-pill px-5 shadow">Update Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {selectedStudent && (
        <div className="modal-overlay" style={{ paddingTop: '90px', alignItems: 'flex-start' }} onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom bg-white animate__animated animate__zoomIn p-0" style={{ maxWidth: '700px', borderRadius: '15px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Full Student Profile</h5>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-md-4 text-center border-end">
                  <img src={selectedStudent.photo || 'https://via.placeholder.com/150'} className="img-fluid rounded mb-3 shadow-sm" alt="Student" />
                  <h5 className="fw-bold">{selectedStudent.name}</h5>
                  <span className="badge bg-dark">{selectedStudent.studentId}</span>
                </div>
                <div className="col-md-8">
                  <div className="row g-3 small">
                    <div className="col-6"><strong>Father:</strong> {selectedStudent.fatherName}</div>
                    <div className="col-6"><strong>Phone:</strong> {selectedStudent.phone}</div>
                    <div className="col-12"><strong>Address:</strong> {selectedStudent.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CERTIFICATE MODAL --- */}
      {certStudent && (
        <div className="modal-overlay" style={{ paddingTop: '90px', alignItems: 'flex-start', zIndex: 1100 }}>
          <div className="modal-content-custom bg-white p-0 shadow-lg" style={{ maxWidth: '95%', width: '1250px', borderRadius: '15px' }}>
            <div className="no-print d-flex justify-content-between align-items-center p-3 bg-dark text-white">
              <h5 className="mb-0 fw-bold">Certificate Generator</h5>
              <button className="btn-close btn-close-white" onClick={() => setCertStudent(null)}></button>
            </div>
            <div className="p-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <Certificate preFillData={certStudent} onSuccess={() => { fetchStudents(); setCertStudent(null); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;