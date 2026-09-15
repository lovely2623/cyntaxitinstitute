import React, { useState, useEffect } from 'react';
import '../admin/AdminLayout.css';

function AddStudent() {
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    admissionDate: new Date().toISOString().split('T')[0],
    phone: '',
    parentPhone: '',
    email: '',
    aadhaar: '',
    bloodGroup: 'Unknown',
    course: 'DCA',
    courseDuration: '6 Months',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    familyIncome: 'Below 1 Lakh',
    
    // Address Details
    addressStreet: '',
    city: '',
    district: '',
    state: 'Himachal Pradesh',
    pincode: '',

    // 10th Standard Details
    tenthSchool: '',
    tenthBoard: '',
    tenthYear: '',
    tenthPercentage: '',
    tenthDoc: '',

    // 12th Standard Details
    twelfthSchool: '',
    twelfthBoard: '',
    twelfthYear: '',
    twelfthPercentage: '',
    twelfthDoc: '',

    // College / Degree Details
    collegeName: '',
    collegeUniversity: '',
    collegeYear: '',
    collegePercentage: '',
    collegeDoc: '',

    photo: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(true);
  const [existingStudents, setExistingStudents] = useState([]);

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

  // Profile Photo Upload (Compressed Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo size must be less than 2MB!");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setFormData(prev => ({ ...prev, photo: compressedBase64 }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Certificate / Document Upload (PDF or Images up to 2MB)
  const handleDocumentUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Document file size must be less than 2MB!");
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, [fieldName]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetId = formData.studentId.trim().toUpperCase();
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    if (!targetId) {
      alert("Registration ID is required!");
      return;
    }

    if (!formData.firstName.trim() || !formData.phone.trim() || !formData.dob.trim()) {
      alert("First Name, Mobile Number, and Date of Birth are mandatory!");
      return;
    }

    const cleanAadhaar = formData.aadhaar.trim();
    if (!cleanAadhaar) {
      alert("Aadhaar Number is mandatory!");
      return;
    }

    const isDuplicate = existingStudents.some(s => 
      (s.studentId && s.studentId.trim().toUpperCase() === targetId) ||
      (s.rollNo && s.rollNo.trim().toUpperCase() === targetId)
    );

    if (isDuplicate) {
      alert(`Registration ID "${targetId}" already exists. Please assign a unique ID.`);
      return;
    }

    setLoading(true);

    const fullAddress = `${formData.addressStreet.trim()}, ${formData.city.trim()}, Dist: ${formData.district.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`.replace(/^, |, $/g, '');

    const cleanPayload = {
      studentId: targetId,
      rollNo: targetId,
      regNo: targetId,
      name: fullName,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      fatherName: formData.fatherName.trim() || "N/A",
      fatherOccupation: formData.fatherOccupation.trim() || "N/A",
      motherName: formData.motherName.trim() || "N/A",
      phone: formData.phone.trim(),
      parentPhone: formData.parentPhone.trim() || "N/A",
      dob: formData.dob.trim(),
      admissionDate: formData.admissionDate,
      joiningDate: formData.admissionDate,
      course: formData.course || "DCA",
      courseDuration: formData.courseDuration || "6 Months",
      gender: formData.gender || "Male",
      email: formData.email.trim() || "N/A",
      familyIncome: formData.familyIncome || "Below 1 Lakh",
      bloodGroup: formData.bloodGroup || "Unknown",
      address: fullAddress,
      photo: formData.photo || "https://via.placeholder.com/150",

      aadhaar: cleanAadhaar,
      adaharNumber: cleanAadhaar,
      adharNumber: cleanAadhaar,
      aadharNumber: cleanAadhaar,
      aadhaarNumber: cleanAadhaar,

      academics: {
        tenth: {
          school: formData.tenthSchool.trim(),
          board: formData.tenthBoard.trim(),
          year: formData.tenthYear.trim(),
          percentage: formData.tenthPercentage.trim(),
          document: formData.tenthDoc
        },
        twelfth: {
          school: formData.twelfthSchool.trim(),
          board: formData.twelfthBoard.trim(),
          year: formData.twelfthYear.trim(),
          percentage: formData.twelfthPercentage.trim(),
          document: formData.twelfthDoc
        },
        college: {
          college: formData.collegeName.trim(),
          university: formData.collegeUniversity.trim(),
          year: formData.collegeYear.trim(),
          percentage: formData.collegePercentage.trim(),
          document: formData.collegeDoc
        }
      },

      details: {
        studentId: targetId,
        name: fullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || "N/A",
        phone: formData.phone.trim(),
        parentPhone: formData.parentPhone.trim() || "N/A",
        gender: formData.gender || "Male",
        dob: formData.dob.trim(),
        admissionDate: formData.admissionDate,
        fatherName: formData.fatherName.trim() || "N/A",
        fatherOccupation: formData.fatherOccupation.trim() || "N/A",
        motherName: formData.motherName.trim() || "N/A",
        familyIncome: formData.familyIncome || "Below 1 Lakh",
        bloodGroup: formData.bloodGroup || "Unknown",
        addressStreet: formData.addressStreet.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        fullAddress: fullAddress,
        tenthSchool: formData.tenthSchool.trim(),
        tenthBoard: formData.tenthBoard.trim(),
        tenthPercentage: formData.tenthPercentage.trim(),
        tenthDoc: formData.tenthDoc,
        twelfthSchool: formData.twelfthSchool.trim(),
        twelfthBoard: formData.twelfthBoard.trim(),
        twelfthPercentage: formData.twelfthPercentage.trim(),
        twelfthDoc: formData.twelfthDoc,
        collegeName: formData.collegeName.trim(),
        collegeUniversity: formData.collegeUniversity.trim(),
        collegePercentage: formData.collegePercentage.trim(),
        collegeDoc: formData.collegeDoc,
        aadhaar: cleanAadhaar
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
        alert(`Admission Successful!\nStudent: ${cleanPayload.name}\nRoll No: ${cleanPayload.studentId}`);
        localStorage.removeItem("cyntax_cached_students_list");
        window.location.reload();
      } else {
        alert(`Registration Failed: ${responseData.message || responseData.error || "Server validation error"}`);
      }
    } catch (error) {
      alert("Server connection failed! Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-2 px-md-4">
      <style>{`
        .custom-form-input {
          width: 100% !important;
          height: 48px !important;
          background-color: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 10px !important;
          padding: 0 14px !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          color: #0f172a !important;
          outline: none !important;
          box-sizing: border-box !important;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .custom-form-input:focus {
          border-color: #0000FF !important;
          box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.12) !important;
        }
        .academic-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
      `}</style>

      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Card Header */}
        <div className="card-header bg-dark text-white py-3 px-3 px-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h4 className="mb-0 fw-bold"><i className="fas fa-user-plus text-warning me-2"></i> Student Admission Form</h4>
            <small className="text-white-50">Institute Academic Registration & Verification Record</small>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold font-monospace fs-6 align-self-start align-self-md-center">
            {fetchingId ? "Generating ID..." : `Assigned ID: ${formData.studentId}`}
          </span>
        </div>

        <div className="card-body p-3 p-md-5 bg-white">
          <form onSubmit={handleSubmit}>

            {/* TOP PROFILE PHOTO SECTION */}
            <div className="text-center mb-5 pb-3 border-bottom">
              <div className="d-inline-block position-relative">
                <img 
                  src={formData.photo || "https://via.placeholder.com/150"} 
                  alt="Student Preview" 
                  style={{
                    width: '130px',
                    height: '130px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '4px solid #0000FF',
                    boxShadow: '0 8px 20px rgba(0, 0, 255, 0.2)'
                  }}
                />
                <label 
                  htmlFor="photoUploadInput" 
                  className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0 shadow"
                  style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Upload Student Photo"
                >
                  <i className="fas fa-camera"></i>
                </label>
                <input 
                  id="photoUploadInput"
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="mt-2">
                <span className="fw-bold text-dark d-block">Student Photograph *</span>
                <small className="text-muted">Click the camera icon to upload (Max: 2MB JPG/PNG)</small>
              </div>
            </div>

            {/* 1. REGISTRATION & COURSE DETAILS */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              1. Registration & Course Details
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">
                  Registration ID * <span className="text-primary fw-normal">(Auto/Editable)</span>
                </label>
                <input 
                  type="text" 
                  className="custom-form-input font-monospace text-primary"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Enrolled Course *</label>
                <select 
                  className="custom-form-input"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="DCA">DCA (Diploma in Computer Applications)</option>
                  <option value="ADCA">ADCA (Advanced Diploma)</option>
                  <option value="Steno">Stenography & Shorthand</option>
                  <option value="Short Term">Short Term / Web Development</option>
                  <option value="Tally">Tally Prime & Accounting</option>
                  <option value="Basic">Basic Computer Operations</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Course Duration</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="e.g. 6 Months / 1 Year"
                  value={formData.courseDuration}
                  onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Admission Date *</label>
                <input 
                  type="date" 
                  className="custom-form-input"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 2. PERSONAL INFORMATION */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              2. Student Personal Information
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">First Name *</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Last Name</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Gender *</label>
                <select 
                  className="custom-form-input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Date of Birth (Password) *</label>
                <input 
                  type="date" 
                  className="custom-form-input" 
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-danger d-block">Aadhaar Card Number *</label>
                <input 
                  type="text" 
                  className="custom-form-input border-danger font-monospace" 
                  placeholder="12-digit Aadhaar Number"
                  maxLength="12"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/[^0-9]/g, '') })}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Blood Group</label>
                <select 
                  className="custom-form-input"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="Unknown">Unknown</option>
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

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Student Mobile Number *</label>
                <input 
                  type="tel" 
                  className="custom-form-input" 
                  placeholder="10-digit Phone Number"
                  maxLength="10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Parents / Guardian Contact Number</label>
                <input 
                  type="tel" 
                  className="custom-form-input" 
                  placeholder="Parents Mobile No."
                  maxLength="10"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value.replace(/[^0-9]/g, '') })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Email Address</label>
                <input 
                  type="email" 
                  className="custom-form-input" 
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* 3. PARENTAGE & SOCIO-ECONOMIC */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              3. Parentage & Family Details
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Father's Full Name</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="Father's Name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Father's Occupation</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="e.g. Govt Employee, Farmer, Business"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Mother's Full Name</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="Mother's Name"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold text-dark d-block">Annual Family Income</label>
                <select 
                  className="custom-form-input"
                  value={formData.familyIncome}
                  onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                >
                  <option value="Below 1 Lakh">Below ₹1,00,000</option>
                  <option value="1 Lakh - 2.5 Lakhs">₹1,00,000 - ₹2,50,000</option>
                  <option value="2.5 Lakhs - 5 Lakhs">₹2,50,000 - ₹5,00,000</option>
                  <option value="Above 5 Lakhs">Above ₹5,00,000</option>
                </select>
              </div>
            </div>

            {/* 4. STRUCTURED ADDRESS */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              4. Residential Address Details
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark d-block">Street Address / Village</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="House No, Street, Village, Post Office"
                  value={formData.addressStreet}
                  onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-bold text-dark d-block">City / Tehsil</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="City / Tehsil"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-bold text-dark d-block">District</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark d-block">State</label>
                <input 
                  type="text" 
                  className="custom-form-input" 
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark d-block">Postal PIN Code</label>
                <input 
                  type="text" 
                  className="custom-form-input font-monospace" 
                  placeholder="6-digit PIN Code"
                  maxLength="6"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                />
              </div>
            </div>

            {/* 5. ACADEMIC QUALIFICATIONS & DOCUMENT UPLOAD */}
            <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
              5. Educational Qualifications & Documents (PDF/JPG/PNG up to 2MB)
            </h6>

            {/* 10th Standard */}
            <div className="academic-card mb-3">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-graduation-cap me-2 text-primary"></i> 10th Standard (Matriculation)</h6>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="small fw-bold text-muted">School / Institution Name</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="School Name"
                    value={formData.tenthSchool}
                    onChange={(e) => setFormData({ ...formData, tenthSchool: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="small fw-bold text-muted">Board (e.g. HPBOSE / CBSE)</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="Board Name"
                    value={formData.tenthBoard}
                    onChange={(e) => setFormData({ ...formData, tenthBoard: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small fw-bold text-muted">Passing Year</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="e.g. 2019"
                    maxLength="4"
                    value={formData.tenthYear}
                    onChange={(e) => setFormData({ ...formData, tenthYear: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="small fw-bold text-muted">Percentage / CGPA</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="e.g. 84.5%"
                    value={formData.tenthPercentage}
                    onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-primary">Attach 10th Certificate / Marksheet (PDF/Image)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept=".pdf,image/*"
                    onChange={(e) => handleDocumentUpload(e, 'tenthDoc')}
                  />
                  {formData.tenthDoc && <small className="text-success fw-bold mt-1 d-block">✓ Document attached successfully</small>}
                </div>
              </div>
            </div>

            {/* 12th Standard */}
            <div className="academic-card mb-3">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-graduation-cap me-2 text-primary"></i> 12th Standard (Higher Secondary)</h6>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="small fw-bold text-muted">School / College Name</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="School / College Name"
                    value={formData.twelfthSchool}
                    onChange={(e) => setFormData({ ...formData, twelfthSchool: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="small fw-bold text-muted">Board (e.g. HPBOSE / CBSE)</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="Board Name"
                    value={formData.twelfthBoard}
                    onChange={(e) => setFormData({ ...formData, twelfthBoard: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small fw-bold text-muted">Passing Year</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="e.g. 2021"
                    maxLength="4"
                    value={formData.twelfthYear}
                    onChange={(e) => setFormData({ ...formData, twelfthYear: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="small fw-bold text-muted">Percentage / CGPA</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="e.g. 78.0%"
                    value={formData.twelfthPercentage}
                    onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-primary">Attach 12th Certificate / Marksheet (PDF/Image)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept=".pdf,image/*"
                    onChange={(e) => handleDocumentUpload(e, 'twelfthDoc')}
                  />
                  {formData.twelfthDoc && <small className="text-success fw-bold mt-1 d-block">✓ Document attached successfully</small>}
                </div>
              </div>
            </div>

            {/* College / University */}
            <div className="academic-card mb-4">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-university me-2 text-primary"></i> Graduation / College Degree (Optional)</h6>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="small fw-bold text-muted">College / Institute Name</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="College Name"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="small fw-bold text-muted">University (e.g. HPU / IGNOU)</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="University Name"
                    value={formData.collegeUniversity}
                    onChange={(e) => setFormData({ ...formData, collegeUniversity: e.target.value })}
                  />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small fw-bold text-muted">Passing Year</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="e.g. 2024"
                    maxLength="4"
                    value={formData.collegeYear}
                    onChange={(e) => setFormData({ ...formData, collegeYear: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="small fw-bold text-muted">Aggregate Percentage</label>
                  <input 
                    type="text" 
                    className="custom-form-input" 
                    placeholder="e.g. 72.5%"
                    value={formData.collegePercentage}
                    onChange={(e) => setFormData({ ...formData, collegePercentage: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-primary">Attach College Degree / Marksheet (PDF/Image)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept=".pdf,image/*"
                    onChange={(e) => handleDocumentUpload(e, 'collegeDoc')}
                  />
                  {formData.collegeDoc && <small className="text-success fw-bold mt-1 d-block">✓ Document attached successfully</small>}
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="text-end border-top pt-4">
              <button 
                type="submit" 
                className="btn btn-warning w-100 w-md-auto px-5 py-3 fw-bold rounded-pill shadow"
                disabled={loading || fetchingId}
                style={{ fontSize: '16px' }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i> Registering Admission...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i> Complete Student Admission
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