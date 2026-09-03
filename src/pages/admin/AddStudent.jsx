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

  // Auto Serial ID: CYN-2601, CYN-2602... (Matches current Year)
  useEffect(() => {
    const generateNextSerialId = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/students`);
        const students = await res.json();

        // 2026 -> "26"
        const currentYearShort = new Date().getFullYear().toString().slice(-2);
        const prefix = `CYN-${currentYearShort}`;

        // Find students with this year's prefix
        const thisYearStudents = Array.isArray(students) ? students.filter(s => {
          const sid = (s.studentId || "").trim().toUpperCase();
          return sid.startsWith(prefix) || sid.startsWith(`CYN${currentYearShort}`);
        }) : [];

        let maxSerial = 0;
        thisYearStudents.forEach(s => {
          const sid = (s.studentId || "").trim().toUpperCase();
          const cleanNum = sid.replace(`CYN-${currentYearShort}`, '').replace(`CYN${currentYearShort}`, '');
          const parsed = parseInt(cleanNum, 10);
          if (!isNaN(parsed) && parsed > maxSerial) {
            maxSerial = parsed;
          }
        });

        const nextNum = (maxSerial + 1).toString().padStart(2, '0');
        const nextId = `${prefix}${nextNum}`;
        setFormData(prev => ({ ...prev, studentId: nextId }));
      } catch (err) {
        console.error("Auto ID fetch error:", err);
        const fallbackYear = new Date().getFullYear().toString().slice(-2);
        setFormData(prev => ({ ...prev, studentId: `CYN-${fallbackYear}01` }));
      } finally {
        setFetchingId(false);
      }
    };

    generateNextSerialId();
  }, [BASE_URL]);

  // Image compression to prevent server payload error
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
    if (!formData.name.trim() || !formData.phone.trim() || !formData.dob.trim()) {
      alert("Name, Phone aur Date of Birth bharna zaroori hai!");
      return;
    }

    setLoading(true);

    // Schema Clean Payload (Server 500 error rokne ke liye clean object)
    const cleanPayload = {
      studentId: formData.studentId.trim(),
      name: formData.name.trim(),
      fatherName: formData.fatherName ? formData.fatherName.trim() : "",
      motherName: formData.motherName ? formData.motherName.trim() : "",
      phone: formData.phone.trim(),
      dob: formData.dob.trim(),
      course: formData.course || "DCA",
      courseDuration: formData.courseDuration || "6 Months",
      photo: formData.photo || "",
      hasGivenTest: false,
      testScore: 0
    };

    try {
      const res = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cleanPayload)
      });

      if (res.ok) {
        alert(`Student ${cleanPayload.name} successfully registered with ID: ${cleanPayload.studentId}!`);
        // Invalidate student list cache
        localStorage.removeItem("cyntax_cached_students_list");
        window.location.reload();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Server responded with error:", errData);
        alert(`Registration fail hua! Server message: ${errData.message || "Invalid data"}`);
      }
    } catch (error) {
      console.error("Network / Server error:", error);
      alert("Server connect nahi ho paya! Please check your network ya thodi der baad prayas karein.");
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
              {/* Registration ID (Auto Serial) */}
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