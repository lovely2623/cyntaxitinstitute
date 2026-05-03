import React, { useState, useRef } from 'react';
import './Certificate.css';

function Certificate() {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    courseName: '',
    duration: '',
    issueDate: new Date().toISOString().split('T')[0],
    certificateNo: `CCH-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef();

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
    <div className="certificate-container">
      {!showCertificate ? (
        <div className="cert-form-card shadow">
          <div className="form-header">
            <h2><i className="fas fa-file-medal"></i> Generate Certificate</h2>
            <p>Student ki details bhariyan aur professional certificate generate karein.</p>
          </div>
          <form onSubmit={handleGenerate} className="row g-3">
            <div className="col-md-6">
              <label>Student Full Name</label>
              <input type="text" name="studentName" className="form-control" placeholder="e.g. Rahul Thakur" required onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label>Father's Name</label>
              <input type="text" name="fatherName" className="form-control" placeholder="e.g. Mr. Sharma" required onChange={handleInputChange} />
            </div>
            <div className="col-md-8">
              <label>Course Name</label>
              <input type="text" name="courseName" className="form-control" placeholder="e.g. Full Stack Web Development (MERN)" required onChange={handleInputChange} />
            </div>
            <div className="col-md-4">
              <label>Duration</label>
              <input type="text" name="duration" className="form-control" placeholder="e.g. 6 Months" required onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label>Issue Date</label>
              <input type="date" name="issueDate" className="form-control" value={formData.issueDate} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label>Certificate No.</label>
              <input type="text" name="certificateNo" className="form-control" value={formData.certificateNo} readOnly />
            </div>
            <div className="col-12 mt-4 text-center">
              <button type="submit" className="save-btn w-50">Design & Preview</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="preview-mode">
          <button className="btn btn-dark mb-4 no-print" onClick={() => setShowCertificate(false)}>
            <i className="fas fa-arrow-left"></i> Edit Details
          </button>
          <button className="btn btn-primary mb-4 ms-3 no-print" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print Certificate
          </button>

          {/* UNIQUE CERTIFICATE DESIGN START */}
          <div className="certificate-paper shadow-lg" ref={certificateRef}>
            <div className="cert-border-outer">
              <div className="cert-border-inner">
                
                {/* Decoration Elements */}
                <div className="corner-decoration top-left"></div>
                <div className="corner-decoration top-right"></div>
                <div className="corner-decoration bottom-left"></div>
                <div className="corner-decoration bottom-right"></div>

                <div className="cert-content text-center">
                  <div className="cert-header">
                    <h1 className="brand-name">CYNTAX CODING HUB</h1>
                    <p className="brand-tagline">Hub Where Developers Learn </p>
                  </div>

                  <div className="cert-body">
                    <h2 className="title">CERTIFICATE OF COMPLETION</h2>
                    <p className="subtitle">This is to certify that Mr./Ms./Mrs.</p>
                    
                    <h3 className="student-name">{formData.studentName}</h3>
                    <p className="son-of">S/o D/o  {formData.fatherName}</p>
                    
                    <div className="course-info">
                      <p>has successfully completed the professional course in</p>
                      <h4 className="course-title">{formData.courseName}</h4>
                      <p>with duration of <strong>{formData.duration}</strong></p>
                    </div>

                    <p className="performance">at Cyntax Coding Hub. We appreciate their dedication and hard work.</p>
                  </div>

                  <div className="cert-footer d-flex justify-content-between align-items-end">
                    <div className="footer-item text-start">
                      <p className="mb-1"><strong>Date:</strong> {formData.issueDate}</p>
                      <p><strong>ID:</strong> {formData.certificateNo}</p>
                    </div>
                    <div className="cert-seal">
                        <div className="seal-inner">CCH 
                          Cyntax Coding Hub 
                        </div>
                    </div>
                    <div className="footer-item text-end">
                      <div className="signature-line"></div>
                      <p>Authorized Signatory</p>
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