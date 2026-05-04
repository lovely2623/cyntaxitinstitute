import React, { useState } from 'react';

function AddStudent() {
  const [student, setStudent] = useState({
    name: '', fatherName: '', motherName: '', fatherOccupation: '',
    dob: '', aadhaarNumber: '', phone: '', address: '',
    course: '', courseDuration: '', joiningDate: '', photo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state add ki

  const API_BASE_URL = "https://cyntaxitinstitute.onrender.com"; 

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("Photo bahut badi hai! 2MB se kam ki photo chune.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudent({ ...student, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDATION FIX ---
    const adhaarStr = String(student.aadhaarNumber).trim();
    if (adhaarStr.length !== 12) {
      alert("Aadhaar Number exactly 12 digit ka hona chahiye!");
      return;
    }

    const phoneStr = String(student.phone).trim();
    if (phoneStr.length !== 10) {
      alert("Phone number exactly 10 digit ka hona chahiye!");
      return;
    }

    setIsSubmitting(true); // Button disable kar do

    try {
      const uniqueId = "CYN-" + Math.floor(1000 + Math.random() * 9000);
      const finalData = { ...student, studentId: uniqueId };

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Mubarak ho! Admission ho gaya. ID: ${uniqueId}`);
        // Form Reset
        setStudent({
          name: '', fatherName: '', motherName: '', fatherOccupation: '',
          dob: '', aadhaarNumber: '', phone: '', address: '',
          course: '', courseDuration: '', joiningDate: '', photo: ''
        });
      } else {
        // Agar backend se validation error aaye (e.g. Duplicate Aadhaar)
        alert("Server Error: " + (result.message || result.error || "Data save nahi hua"));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Backend se connection nahi ho paa raha! Check karein ki Render par backend 'Active' hai ya nahi.");
    } finally {
      setIsSubmitting(false); // Button wapas enable
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold text-center">🎓 Student Admission Form</h4>
        </div>
        <form onSubmit={handleSubmit} className="card-body p-4 bg-light">
          <div className="row">
            <div className="col-md-12 text-center mb-4">
              <div className="position-relative d-inline-block">
                <img src={student.photo || 'https://via.placeholder.com/150'} alt="Preview" 
                     className="shadow-sm"
                     style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '50%', border: '4px solid white' }} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} 
                       className="form-control form-control-sm mt-2" required={!student.photo} />
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Student Name</label>
              <input type="text" className="form-control" value={student.name} required 
                     onChange={(e) => setStudent({...student, name: e.target.value})} placeholder="Enter Full Name" />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Father's Name</label>
              <input type="text" className="form-control" value={student.fatherName} required 
                     onChange={(e) => setStudent({...student, fatherName: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Mother's Name</label>
              <input type="text" className="form-control" value={student.motherName} required 
                     onChange={(e) => setStudent({...student, motherName: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Aadhaar Number (12 Digits)</label>
              <input type="number" className="form-control" value={student.aadhaarNumber} required 
                     onChange={(e) => setStudent({...student, aadhaarNumber: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Date of Birth</label>
              <input type="date" className="form-control" value={student.dob} required 
                     onChange={(e) => setStudent({...student, dob: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Phone Number</label>
              <input type="number" className="form-control" value={student.phone} required 
                     onChange={(e) => setStudent({...student, phone: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Course Selected</label>
              <select className="form-select" value={student.course} required 
                      onChange={(e) => setStudent({...student, course: e.target.value})}>
                <option value="">Choose Course...</option>
                <option value="DCA">DCA</option>
                <option value="ADCA">ADCA</option>
                <option value="Steno">Steno</option>
                <option value="Tally">Tally</option>
              </select>
            </div>
             <div className="col-md-4 mb-3">
              <label className="fw-bold small">Duration</label>
              <input type="text" className="form-control" value={student.courseDuration} placeholder="e.g. 6 Months" 
                     onChange={(e) => setStudent({...student, courseDuration: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="fw-bold small">Joining Date</label>
              <input type="date" className="form-control" value={student.joiningDate} required
                     onChange={(e) => setStudent({...student, joiningDate: e.target.value})} />
            </div>
            <div className="col-md-12 mb-3">
              <label className="fw-bold small">Full Address</label>
              <textarea className="form-control" value={student.address} required rows="2"
                        onChange={(e) => setStudent({...student, address: e.target.value})} />
            </div>

            <div className="col-12 mt-3">
              <button type="submit" className="btn btn-success btn-lg w-100 shadow" disabled={isSubmitting}>
                {isSubmitting ? "Saving Data..." : "🚀 Save Admission & Generate ID"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;