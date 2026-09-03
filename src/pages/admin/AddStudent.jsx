import React, { useState, useEffect } from 'react';
import '../admin/AdminLayout.css';

function AddStudent() {
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    aadhaar: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    familyIncome: 'Below 1 Lakh',
    qualification: '12th Pass',
    bloodGroup: 'Unknown',
    address: '',
    course: 'DCA',
    courseDuration: '6 Months',
    photo: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const [existingStudents, setExistingStudents] = useState([]);

  // 1. Auto Serial Suggestion + Existing List Cache
  useEffect(() => {
    const fetchStudentsAndGenerateId = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/students`);
        const students = await res.json();
        
        if (Array.isArray(students)) {
          setExistingStudents(students);

          const currentYearShort = new Date().getFullYear().toString().slice(-2);
          const prefix = `CYN-${currentYearShort}`;

          let maxSerial = 0;
          students.forEach(s => {
            const sid = (s.studentId || s.rollNo || s.regNo || "").trim().toUpperCase();
            if (sid.includes(`CYN-${currentYearShort}`) || sid.includes(`CYN${currentYearShort}`)) {
              const cleanNum = sid.replace(`CYN-${currentYearShort}`, '').replace(`CYN${currentYearShort}`, '');
              const parsed = parseInt(cleanNum, 10);
              if (!isNaN(parsed) && parsed > maxSerial) {
                maxSerial = parsed;
              }
            }
          });

          const nextNum = (maxSerial + 1).toString().padStart(2, '0');
          setFormData(prev => ({ ...prev, studentId: `${prefix}${nextNum}` }));
        }
      } catch (err) {
        console.error("Auto ID fetch error:", err);
        const fallbackYear = new Date().getFullYear().toString().slice(-2);
        setFormData(prev => ({ ...prev, studentId: `CYN-${fallbackYear}01` }));
      } finally {
        setFetchingId(false);
      }
    };

    fetchStudentsAndGenerateId();
  }, [BASE_URL]);

  // 2. Client-side Image Compression
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, photo: compressedBase64 }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Form Submission Engine
  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetId = formData.studentId.trim().toUpperCase();

    if (!targetId) {
      alert("Registration ID khali nahi ho sakti!");
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.dob.trim()) {
      alert("Student Name, Mobile Number aur DOB bharna zaroori hai!");
      return;
    }

    if (!formData.aadhaar.trim()) {
      alert("Aadhaar Number bharna anivarya (required) hai!");
      return;
    }

    // Safety Duplicate Check (Agar user manually kisi active bache ka roll number daal de)
    const isDuplicate = existingStudents.some(s => 
      (s.studentId && s.studentId.trim().toUpperCase() === targetId) ||
      (s.rollNo && s.rollNo.trim().toUpperCase() === targetId) ||
      (s.regNo && s.regNo.trim().toUpperCase() === targetId)
    );

    if (isDuplicate) {
      alert(`⚠️ Registration ID Conflict!\n"${targetId}" pehle se kisi active student ke paas allot hai. Kripya alag roll number enter karein.`);
      return;
    }

    setLoading(true);

    const cleanAadhaar = formData.aadhaar.trim();

    const cleanPayload = {
      adaharNumber: cleanAadhaar,
      adharNumber: cleanAadhaar,
      aadharNumber: cleanAadhaar,
      aadhaarNumber: cleanAadhaar,
      aadhar: cleanAadhaar,
      aadhaar: cleanAadhaar,
      adhar: cleanAadhaar,
      adahar: cleanAadhaar,

      studentId: targetId,
      rollNo: targetId,
      regNo: targetId,

      name: formData.name.trim(),
      fatherName: formData.fatherName.trim() || "N/A",
      fatherOccupation: formData.fatherOccupation.trim() || "N/A",
      motherName: formData.motherName.trim() || "N/A",
      phone: formData.phone.trim(),
      dob: formData.dob.trim(),
      course: formData.course || "DCA",
      courseDuration: formData.courseDuration || "6 Months",
      gender: formData.gender || "Male",
      email: formData.email.trim() || "N/A",
      familyIncome: formData.familyIncome || "Below 1 Lakh",
      qualification: formData.qualification || "12th Pass",
      bloodGroup: formData.bloodGroup || "Unknown",
      address: formData.address.trim() || "N/A",
      photo: formData.photo || "https://via.placeholder.com/150",

      details: {
        adaharNumber: cleanAadhaar,
        aadhaar: cleanAadhaar,
        fatherOccupation: formData.fatherOccupation.trim(),
        familyIncome: formData.familyIncome,
        qualification: formData.qualification,
        bloodGroup: formData.bloodGroup,
        address: formData.address.trim(),
        email: formData.email.trim(),
        gender: formData.gender
      },

      hasGivenTest: false,
      testScore: 0,
      testGrade: "N/A",
      isCertificateIssued: false
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

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(`Success! Student "${cleanPayload.name}" ka admission ho gaya hai.\nAllotted ID: ${cleanPayload.studentId}`);
        localStorage.removeItem("cyntax_cached_students_list");
        window.location.reload();
      } else {
        console.error("Backend Validation Error:", responseData);
        alert(`Registration Fail: ${responseData.message || responseData.error || "Server validation error"}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Server connection fail! Internet check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '1050px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="card-header bg-dark text-white py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h4 className="mb-0 fw-bold">Comprehensive Student Admission</h4>
            <small className="text-white-50">Institute Academic & Verification Record</small>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold font-monospace fs-6 align-self-start align-self-md-center">
            {fetchingId ? "Generating ID..." : `Assigned ID: ${formData.studentId}`}
          </span>
        </div>

        {/* Form Body */}
        <div className="card-body p-4 p-md-5 bg-white">
          <form onSubmit={handleSubmit}>

            {/* SECTION 1: REGISTRATION & COURSE DETAILS */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              <i className="fas fa-graduation-cap me-2"></i> 1. Course & Registration Details
            </h6>
            <div className="row g-3 mb-4">
              
              {/* CUSTOMIZABLE REGISTRATION ID */}
              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark">
                  Registration ID * <span className="text-primary fw-normal">(Auto / Custom Editable)</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-edit text-primary"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 fw-bold font-monospace text-primary"
                    placeholder="e.g. CYN-2601"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  * Auto-generated hai, par aap purana ya custom roll no bhi type kar sakte hain.
                </small>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Course Enrolled *</label>
                <select 
                  className="form-select"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="DCA">DCA (Diploma in Computer Applications)</option>
                  <option value="ADCA">ADCA (Advanced Diploma in Computer Applications)</option>
                  <option value="Steno">Stenography & Shorthand</option>
                  <option value="Short Term">Short Term / Web Development</option>
                  <option value="Tally">Tally Prime & Accounting</option>
                  <option value="Basic">Basic Computer Operations</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Course Duration</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 6 Months / 1 Year"
                  value={formData.courseDuration}
                  onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
                />
              </div>
            </div>

            {/* SECTION 2: PERSONAL IDENTITY & BIODATA */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              <i className="fas fa-user me-2"></i> 2. Personal Information & Identity
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Student Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Gender *</label>
                <select 
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Date of Birth (Password) *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-danger">Aadhaar Card Number * (Required)</label>
                <input 
                  type="text" 
                  className="form-control border-danger" 
                  placeholder="12-digit Aadhaar Number"
                  maxLength="12"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/[^0-9]/g, '') })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Primary Phone Number *</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="10-digit Mobile No."
                  maxLength="10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Highest Qualification</label>
                <select 
                  className="form-select"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                >
                  <option value="10th Pass">10th Matriculation</option>
                  <option value="12th Pass">12th Intermediate</option>
                  <option value="Undergraduate">Undergraduate / Pursuing Graduation</option>
                  <option value="Graduate">Graduate (BA, BSc, BCom, BCA, BTech)</option>
                  <option value="Postgraduate">Postgraduate (MCA, MA, MSc)</option>
                  <option value="Other">Other Diploma / Certificate</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Blood Group</label>
                <select 
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="Unknown">Don't Know / Not Available</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* SECTION 3: PARENTAL & SOCIO-ECONOMIC BACKGROUND */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              <i className="fas fa-home me-2"></i> 3. Family Background & Occupation
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Father's Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Father's Name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Father's Occupation</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Govt Employee, Agriculture, Business, Private Job"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Mother's Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Mother's Name"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Annual Family Income</label>
                <select 
                  className="form-select"
                  value={formData.familyIncome}
                  onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                >
                  <option value="Below 1 Lakh">Below ₹1,00,000 / annum</option>
                  <option value="1 Lakh - 2.5 Lakhs">₹1,00,000 - ₹2,50,000 / annum</option>
                  <option value="2.5 Lakhs - 5 Lakhs">₹2,50,000 - ₹5,00,000 / annum</option>
                  <option value="Above 5 Lakhs">Above ₹5,00,000 / annum</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Permanent / Residential Address</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  placeholder="Village / Ward, Post Office, Tehsil, District, PIN Code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                ></textarea>
              </div>
            </div>

            {/* SECTION 4: PHOTO UPLOAD */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              <i className="fas fa-camera me-2"></i> 4. Student Photograph
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                  * Image browser mein hi auto-compress ho jayegi.
                </small>
                {formData.photo && (
                  <div className="mt-3">
                    <img 
                      src={formData.photo} 
                      alt="Student Preview" 
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #0000FF' }} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-end border-top pt-4">
              <button 
                type="submit" 
                className="btn btn-warning px-5 py-3 fw-bold rounded-pill shadow"
                disabled={loading || fetchingId}
                style={{ fontSize: '15px' }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i> Registering Student...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i> Complete Admission
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;