import React, { useState, useEffect } from 'react';
import '../admin/AdminLayout.css';

function AddStudent() {
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    fatherName: '',
    motherName: '',
    phone: '',
    dob: '',
    course: 'DCA',
    courseDuration: '6 Months',
    photo: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);

  // Auto Serial ID Generator: CYN-YY01, CYN-YY02...
  useEffect(() => {
    const generateNextSerialId = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/students`);
        const students = await res.json();

        // Current Year 2 Digits (e.g. 2026 -> "26")
        const currentYearShort = new Date().getFullYear().toString().slice(-2);
        const prefix = `CYN-${currentYearShort}`;

        // Filter students belonging to this year's prefix
        const thisYearStudents = students.filter(s => 
          s.studentId && s.studentId.trim().toUpperCase().startsWith(prefix)
        );

        let maxSerial = 0;
        thisYearStudents.forEach(s => {
          const numPart = s.studentId.trim().toUpperCase().replace(prefix, '');
          const parsedNum = parseInt(numPart, 10);
          if (!isNaN(parsedNum) && parsedNum > maxSerial) {
            maxSerial = parsedNum;
          }
        });

        // Next serial padded to 2 digits (01, 02, 03... 99, 100...)
        const nextSerial = (maxSerial + 1).toString().padStart(2, '0');
        const generatedId = `${prefix}${nextSerial}`;

        setFormData(prev => ({ ...prev, studentId: generatedId }));
      } catch (err) {
        console.error("Auto ID generation error:", err);
        const fallbackYear = new Date().getFullYear().toString().slice(-2);
        setFormData(prev => ({ ...prev, studentId: `CYN-${fallbackYear}01` }));
      } finally {
        setFetchingId(false);
      }
    };

    generateNextSerialId();
  }, [BASE_URL]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo size 2MB se kam honi chahiye!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.dob) {
      alert("Kripya saari required details bharein!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hasGivenTest: false,
          testScore: 0,
          isCertificateIssued: false
        })
      });

      if (res.ok) {
        alert(`Student ${formData.name} successfully registered with ID: ${formData.studentId}!`);
        // Refresh local cache for 0ms loading in StudentList
        localStorage.removeItem("cyntax_cached_students_list");
        window.location.reload();
      } else {
        alert("Registration fail hua! Server error.");
      }
    } catch (error) {
      console.error(error);
      alert("Server connect nahi ho paya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">New Student Admission</h4>
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold">
            {fetchingId ? "Generating ID..." : `Assigned: ${formData.studentId}`}
          </span>
        </div>

        <div className="card-body p-4 p-md-5 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Registration ID (Auto-generated & locked) */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Registration ID (Auto Serial)</label>
                <input 
                  type="text" 
                  className="form-control bg-light fw-bold font-monospace text-primary" 
                  value={formData.studentId} 
                  readOnly 
                  required
                />
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  * Current year ke hisaab se auto-generate hua hai (CYN-YY##).
                </small>
              </div>

              {/* Full Name */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Student Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Father's Name */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Father's Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Father's name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>

              {/* Mother's Name */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Mother's Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Mother's name"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                />
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Phone Number *</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Date of Birth */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Date of Birth (Password) *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              {/* Course */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Course Enrolled *</label>
                <select 
                  className="form-select"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="DCA">DCA (Diploma in Computer Applications)</option>
                  <option value="ADCA">ADCA (Advanced Diploma)</option>
                  <option value="Steno">Stenography & Shorthand</option>
                  <option value="Short Term">Short Term Course</option>
                  <option value="Tally">Tally Prime & Accounting</option>
                </select>
              </div>

              {/* Duration */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Course Duration</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 6 Months / 1 Year"
                  value={formData.courseDuration}
                  onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
                />
              </div>

              {/* Photo Upload */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Student Photo</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                {formData.photo && (
                  <div className="mt-2">
                    <img src={formData.photo} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-12 text-end mt-4">
                <button 
                  type="submit" 
                  className="btn btn-warning px-5 py-2 fw-bold rounded-pill shadow-sm"
                  disabled={loading || fetchingId}
                >
                  {loading ? <><i className="fas fa-spinner fa-spin me-2"></i> Registering...</> : "Submit Admission"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;