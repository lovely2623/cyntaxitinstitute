import React, { useState } from 'react';

function AddStudent() {
  const [student, setStudent] = useState({
    name: '', fatherName: '', motherName: '', fatherOccupation: '',
    dob: '', aadhaarNumber: '', phone: '', address: '',
    course: '', courseDuration: '', joiningDate: '', photo: ''
  });

  // CHANGE THIS TO YOUR RENDER URL
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
    console.log("Submit button clicked...");

    // --- VALIDATION ---
    const adhaarStr = student.aadhaarNumber ? student.aadhaarNumber.toString() : "";
    if (adhaarStr.length !== 12) {
      alert("Aadhaar Number 12 digit ka hona chahiye!");
      return;
    }

    const phoneStr = student.phone ? student.phone.toString() : "";
    if (phoneStr.length !== 10) {
      alert("Phone number 10 digit ka hona chahiye!");
      return;
    }

    try {
      const uniqueId = "CYN-" + Math.floor(1000 + Math.random() * 9000);
      const finalData = { ...student, studentId: uniqueId };

      console.log("Sending data to:", `${API_BASE_URL}/api/students`);
      
      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Mubarak ho! Admission ho gaya. ID: ${uniqueId}`);
        setStudent({
          name: '', fatherName: '', motherName: '', fatherOccupation: '',
          dob: '', aadhaarNumber: '', phone: '', address: '',
          course: '', courseDuration: '', joiningDate: '', photo: ''
        });
      } else {
        alert("Server Error: " + result.error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Backend se connection nahi ho paa raha! Check if Backend is Live on Render.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white">
          <h4 className="mb-0">🎓 Student Admission Form</h4>
        </div>
        <form onSubmit={handleSubmit} className="card-body p-4">
          <div className="row">
            <div className="col-md-12 text-center mb-4">
              <img src={student.photo || 'https://via.placeholder.com/150'} alt="Preview" 
                   style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px', border: '2px dashed #ccc' }} />
              <br />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2" />
            </div>

            <div className="col-md-4 mb-3">
              <label>Student Name</label>
              <input type="text" className="form-control" value={student.name} required 
                     onChange={(e) => setStudent({...student, name: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Father's Name</label>
              <input type="text" className="form-control" value={student.fatherName} required 
                     onChange={(e) => setStudent({...student, fatherName: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Mother's Name</label>
              <input type="text" className="form-control" value={student.motherName} required 
                     onChange={(e) => setStudent({...student, motherName: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Aadhaar Number</label>
              <input type="number" className="form-control" value={student.aadhaarNumber} required 
                     onChange={(e) => setStudent({...student, aadhaarNumber: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Date of Birth</label>
              <input type="date" className="form-control" value={student.dob} required 
                     onChange={(e) => setStudent({...student, dob: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Phone Number</label>
              <input type="number" className="form-control" value={student.phone} required 
                     onChange={(e) => setStudent({...student, phone: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Course Selected</label>
              <select className="form-select" value={student.course} required 
                      onChange={(e) => setStudent({...student, course: e.target.value})}>
                <option value="">Choose Course...</option>
                <option value="DCA">DCA</option>
                <option value="ADCA">ADCA</option>
                <option value="Steno">Steno</option>
              </select>
            </div>
             <div className="col-md-4 mb-3">
              <label>Duration</label>
              <input type="text" className="form-control" value={student.courseDuration} placeholder="e.g. 6 Months" 
                     onChange={(e) => setStudent({...student, courseDuration: e.target.value})} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Joining Date</label>
              <input type="date" className="form-control" value={student.joiningDate} 
                     onChange={(e) => setStudent({...student, joiningDate: e.target.value})} />
            </div>
            <div className="col-md-12 mb-3">
              <label>Address</label>
              <textarea className="form-control" value={student.address} 
                        onChange={(e) => setStudent({...student, address: e.target.value})} />
            </div>

            <div className="col-12 mt-3">
              <button type="submit" className="btn btn-success btn-lg w-100 shadow-sm">
                Save Admission & Generate ID
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudent;