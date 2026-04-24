import React, { useState, useEffect, useCallback } from 'react';
import '../admin/AdminLayout.css';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null); // View Modal
  const [editStudent, setEditStudent] = useState(null); // Edit Modal

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/students', { cache: 'no-store' });
      const data = await response.json();
      setStudents(data.reverse());
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (window.confirm("Bhai, pakka delete karna hai?")) {
      await fetch(`http://localhost:5000/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/students/${editStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStudent)
      });

      if (response.ok) {
        alert("Data update ho gaya master ji!");
        setEditStudent(null);
        fetchStudents();
      }
    } catch (error) {
      alert("Update fail ho gaya, server check karo.");
    }
  };

  const formatDate = (dateString) => {
    if(!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container-fluid mt-4 fade-in">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0 text-primary fw-bold">Cyntax Admin - Student Control</h4>
          <span className="badge bg-primary fs-6">{students.length} Total</span>
        </div>
        
        <div className="table-responsive p-3">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Student Details</th>
                <th>Course</th>
                <th className="text-center">Control</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="fw-bold">{s.studentId}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <img src={s.photo || 'https://via.placeholder.com/40'} alt="" className="rounded-circle me-3" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                      <div>
                        <div className="fw-bold">{s.name}</div>
                        <small className="text-muted">{s.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge bg-info text-dark">{s.course}</span></td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setSelectedStudent(s)}><i className="fas fa-eye"></i></button>
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => setEditStudent(s)}><i className="fas fa-edit"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW MODAL (Ab Aadhaar dikhega) --- */}
  {selectedStudent && (
  <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
    <div className="modal-content-custom rounded-4 shadow p-4" onClick={e => e.stopPropagation()}>
      <div className="d-flex justify-content-between">
        <h3 className="fw-bold" style={{color: '#000'}}>{selectedStudent.name}</h3>
        <button className="btn-close" onClick={() => setSelectedStudent(null)}></button>
      </div>
      <hr />
      <div className="row g-3" style={{color: '#333'}}>
        {/* Aadhaar Redaction hata kar seedha digits dikha di hain */}
        <div className="col-6"><strong>Aadhaar:</strong> {selectedStudent.aadhaarNumber}</div>
        <div className="col-6"><strong>ID:</strong> {selectedStudent.studentId}</div>
        <div className="col-6"><strong>Father:</strong> {selectedStudent.fatherName}</div>
        <div className="col-6"><strong>Phone:</strong> {selectedStudent.phone}</div>
        <div className="col-12 text-muted"><strong>Address:</strong> {selectedStudent.address}</div>
      </div>
    </div>
  </div>
)}

      {/* --- EDIT MODAL (Full Access) --- */}
      {editStudent && (
        <div className="modal-overlay">
          <div className="modal-content-custom rounded-4 shadow p-4" style={{maxWidth: '700px'}}>
            <h4 className="fw-bold text-warning mb-4">Edit Student Profile</h4>
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={editStudent.name} onChange={(e) => setEditStudent({...editStudent, name: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Aadhaar Number</label>
                  <input type="text" className="form-control" value={editStudent.aadhaarNumber} onChange={(e) => setEditStudent({...editStudent, aadhaarNumber: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Father's Name</label>
                  <input type="text" className="form-control" value={editStudent.fatherName} onChange={(e) => setEditStudent({...editStudent, fatherName: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" value={editStudent.phone} onChange={(e) => setEditStudent({...editStudent, phone: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Course</label>
                  <select className="form-select" value={editStudent.course} onChange={(e) => setEditStudent({...editStudent, course: e.target.value})}>
                    <option value="DCA">DCA</option>
                    <option value="ADCA">ADCA</option>
                    <option value="Web Dev">Web Dev</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={editStudent.status} onChange={(e) => setEditStudent({...editStudent, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" value={editStudent.address} onChange={(e) => setEditStudent({...editStudent, address: e.target.value})} />
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setEditStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;