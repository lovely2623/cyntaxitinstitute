import React, { useState, useRef } from 'react';
import './Certificate.css';

function Certificate() {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    regNo: `CCH/${new Date().getFullYear()}/`,
    courseName: '',
    fromDate: '',
    toDate: '',
    duration: '',
    grade: 'A++', // Default Grade
    issueDate: new Date().toISOString().split('T')[0],
    certificateNo: `CCH-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const [showCertificate, setShowCertificate] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setShowCertificate(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-page-container">
      {!showCertificate ? (
        <div className="cert-form-card shadow no-print">
          <div className="form-header">
            <h2><i className="fas fa-certificate"></i> Official Certificate Portal</h2>
            <p>Cyntax Coding Hub - Student Credential Management</p>
          </div>
          <form onSubmit={handleGenerate} className="row g-3">
            <div className="col-md-6">
              <label>Student Name</label>
              <input type="text" name="studentName" className="form-control" placeholder="Full Name" required onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label>Father's Name</label>
              <input type="text" name="fatherName" className="form-control" placeholder="S/o Shri..." required onChange={handleInputChange} />
            </div>
            <div className="col-md-4">
              <label>Registration No.</label>
              <input type="text" name="regNo" className="form-control" value={formData.regNo} onChange={handleInputChange} />
            </div>
            <div className="col-md-5">
              <label>Course Name</label>
              <input type="text" name="courseName" className="form-control" placeholder="e.g. MERN Stack Development" required onChange={handleInputChange} />
            </div>
            <div className="col-md-3">
              <label>Awarded Grade</label>
              <select name="grade" className="form-select" onChange={handleInputChange} value={formData.grade}>
                <option value="A++">A++ (Exceptional)</option>
                <option value="A+">A+ (Excellent)</option>
                <option value="A">A (Very Good)</option>
                <option value="B">B (Good)</option>
              </select>
            </div>
            <div className="col-md-3">
              <label>From Date</label>
              <input type="date" name="fromDate" className="form-control" required onChange={handleInputChange} />
            </div>
            <div className="col-md-3">
              <label>To Date</label>
              <input type="date" name="toDate" className="form-control" required onChange={handleInputChange} />
            </div>
            <div className="col-md-3">
              <label>Duration</label>
              <input type="text" name="duration" className="form-control" placeholder="e.g. 6 Months" required onChange={handleInputChange} />
            </div>
            <div className="col-md-3">
              <label>Issue Date</label>
              <input type="date" name="issueDate" className="form-control" value={formData.issueDate} onChange={handleInputChange} />
            </div>
            <div className="col-12 mt-4 text-center">
              <button type="submit" className="save-btn w-50">Preview Industrial Design</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="preview-section">
          <div className="action-buttons no-print text-center mb-4">
            <button className="btn btn-outline-dark me-2" onClick={() => setShowCertificate(false)}>
              <i className="fas fa-edit"></i> Back to Edit
            </button>
            <button className="btn btn-success" onClick={handlePrint}>
              <i className="fas fa-print"></i> Print (A4 Landscape)
            </button>
          </div>

          <div className="a4-certificate-paper">
            <div className="cert-outer-border">
              <div className="cert-inner-border">
                
                {/* Background Watermark */}
                <div className="watermark-text">CYNTAX CODING HUB</div>

                {/* Accreditations Header */}
                <div className="cert-top-header d-flex justify-content-between align-items-start">
                  <div className="left-meta">
                    <p className="m-0">ISO 9001:2015 Certified</p>
                    <p className="m-0">MSME Udyam: HP-07-XXXX</p>
                  </div>
                  <div className="right-meta text-end">
                    <p className="m-0">Affiliated with AISECT</p>
                    <p className="m-0"><strong>Reg No:</strong> {formData.regNo}</p>
                  </div>
                </div>

                <div className="cert-main-content text-center">
                  <h1 className="inst-name">CYNTAX CODING HUB</h1>
                  <p className="inst-sub">Premium IT Training & Software Development Centre</p>
                  <p className="tagline-cert">"Where Syntax Ends, Innovation Begins"</p>

                  <div className="title-ribbon">
                    <h2 className="main-title">CERTIFICATE OF EXCELLENCE</h2>
                  </div>

                  <p className="certify-text">This is to certify that Mr. / Ms.</p>
                  <h3 className="student-name-display">{formData.studentName}</h3>
                  <p className="father-text">Son / Daughter of <strong>Shri {formData.fatherName}</strong></p>
                  
                  <p className="completion-text">
                    has successfully completed the professional course in
                  </p>
                  <h4 className="course-name-display">{formData.courseName}</h4>
                  
                  <div className="info-grid-cert">
                    <span>Duration: <strong>{formData.duration}</strong></span>
                    <span className="mx-3">|</span>
                    <span>Session: <strong>{formData.fromDate}</strong> To <strong>{formData.toDate}</strong></span>
                  </div>

                  <p className="grade-award-text">
                    and has been awarded Grade <span className="grade-highlight">{formData.grade}</span> 
                    in the final evaluation.
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="cert-footer-layout">
                    <div className="footer-left">
                        <p><strong>Place:</strong> Shimla, H.P.</p>
                        <p><strong>Date:</strong> {formData.issueDate}</p>
                        <div className="verification-code">
                           Verification ID: {formData.certificateNo}
                        </div>
                    </div>

                    <div className="footer-center">
                        <div className="official-seal-new">
                            <div className="seal-content">
                              <span>CCH</span>
                              <small>Official Seal</small>
                            </div>
                        </div>
                    </div>

                    <div className="footer-right">
                        <div className="signature-box">
                            <div className="sign-line-new"></div>
                            <p className="m-0"><strong>Director</strong></p>
                            <p className="small-text">Authorized Signatory</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificate;