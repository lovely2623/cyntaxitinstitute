import React, { useState, useEffect, useCallback } from 'react';
import '../admin/AdminLayout.css';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH: Optimization with loading state
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('https://cyntaxitinstitute.onrender.com/api/students', { 
        cache: 'no-cache' 
      });
      const data = await response.json();
      // Reverse optimized
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

  // DELETE: UI se turant hata dega (Optimistic)
  const handleDelete = async (id) => {
    if (window.confirm("Bhai, pakka delete karna hai?")) {
      const originalStudents = [...students];
      setStudents(students.filter(s => s._id !== id)); // Turant UI se delete

      try {
        await fetch(`https://cyntaxitinstitute.onrender.com/api/students/${id}`, { method: 'DELETE' });
      } catch (error) {
        setStudents(originalStudents); // Error aaye toh wapas le aao
        alert("Delete fail ho gaya!");
      }
    }
  };

  // UPDATE: Bina reload ke UI update karega
  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedData = editStudent;
    
    // Optimistic UI Update
    setStudents(prev => prev.map(s => s._id === updatedData._id ? updatedData : s));
    setEditStudent(null);

    try {
      const response = await fetch(`https://cyntaxitinstitute.onrender.com/api/students/${updatedData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error();
      // Master ji, update successful!
    } catch (error) {
      alert("Backend update fail! Refresh karke check karein.");
      fetchStudents(); // Rollback
    }
  };

  if (loading) return <div className="text-center p-5"><h4>🔄 Loading Cyntax Records...</h4></div>;

  return (
    <div className="container-fluid mt-4 fade-in">
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0 fw-bold"><i className="fas fa-users-cog me-2"></i>Student Control</h4>
          <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold" onClick={fetchStudents}>
            <i className="fas fa-sync me-1"></i> Sync
          </button>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Student</th>
                <th>Course</th>
                <th>ID No.</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <img src={s.photo || 'https://via.placeholder.com/40'} alt="" className="rounded-circle border me-3" style={{width: '45px', height: '45px', objectFit: 'cover'}} />
                      <div>
                        <div className="fw-bold text-dark">{s.name}</div>
                        <small className="text-muted">{s.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle">{s.course}</span></td>
                  <td className="text-muted font-monospace">{s.studentId}</td>
                  <td className="text-center pe-4">
                    <div className="btn-group shadow-sm rounded-3">
                      <button className="btn btn-white btn-sm border" onClick={() => setSelectedStudent(s)} title="View"><i className="fas fa-eye text-primary"></i></button>
                      <button className="btn btn-white btn-sm border" onClick={() => setEditStudent(s)} title="Edit"><i className="fas fa-edit text-warning"></i></button>
                      <button className="btn btn-white btn-sm border" onClick={() => handleDelete(s._id)} title="Delete"><i className="fas fa-trash text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW MODAL --- */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content-custom animate__animated animate__zoomIn p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-4 text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fw-bold">Student Profile</h4>
              <button className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
            </div>
            <div className="p-4">
               <div className="row g-4">
                  <div className="col-4">
                     <img src={selectedStudent.photo || 'https://via.placeholder.com/100'} className="img-fluid rounded-4 shadow-sm border" alt="Student" />
                  </div>
                  <div className="col-8">
                     <h3 className="fw-bold mb-1">{selectedStudent.name}</h3>
                     <p className="text-muted mb-3">{selectedStudent.course} Student</p>
                     <div className="row g-2 small">
                        <div className="col-6"><strong>ID:</strong> {selectedStudent.studentId}</div>
                        <div className="col-6"><strong>Aadhaar:</strong> [Aadhaar Redacted]</div>
                        <div className="col-6"><strong>Father:</strong> {selectedStudent.fatherName}</div>
                        <div className="col-6"><strong>Phone:</strong> {selectedStudent.phone}</div>
                        <div className="col-12 mt-2 p-2 bg-light rounded"><strong>Address:</strong> {selectedStudent.address}</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editStudent && (
        <div className="modal-overlay">
          <div className="modal-content-custom animate__animated animate__fadeInUp p-4" style={{maxWidth: '700px'}}>
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h4 className="fw-bold text-dark mb-0"><i className="fas fa-user-edit me-2"></i>Update Record</h4>
               <button className="btn-close" onClick={() => setEditStudent(null)}></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Full Name</label>
                  <input type="text" className="form-control bg-light" value={editStudent.name} onChange={(e) => setEditStudent({...editStudent, name: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Aadhaar Number</label>
                  <input type="text" className="form-control bg-light" value={editStudent.aadhaarNumber} onChange={(e) => setEditStudent({...editStudent, aadhaarNumber: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Phone</label>
                  <input type="text" className="form-control bg-light" value={editStudent.phone} onChange={(e) => setEditStudent({...editStudent, phone: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Status</label>
                  <select className="form-select bg-light" value={editStudent.status} onChange={(e) => setEditStudent({...editStudent, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold small">Address</label>
                  <textarea className="form-control bg-light" rows="2" value={editStudent.address} onChange={(e) => setEditStudent({...editStudent, address: e.target.value})} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-top text-end">
                <button type="button" className="btn btn-light px-4 me-2" onClick={() => setEditStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-dark px-4 shadow">Update Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;