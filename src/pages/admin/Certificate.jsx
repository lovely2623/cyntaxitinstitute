import React, { useState } from 'react';
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
    grade: 'A++',
    issueDate: new Date().toISOString().split('T')[0],
    certificateNo: `CCH-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const [showCertificate, setShowCertificate] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="certificate-portal">
      {!showCertificate ? (
        <div className="form-wrapper no-print container py-5">
          <div className="form-card shadow-lg p-4 bg-white rounded-4">
            <h2 className="fw-bold text-primary mb-4 text-center">Cyntax Coding Hub | Certificate Manager</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowCertificate(true); }} className="row g-3">
              <div className="col-md-6"><label className="fw-bold">Student Full Name</label><input type="text" name="studentName" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-6"><label className="fw-bold">Father's Name</label><input type="text" name="fatherName" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-4"><label className="fw-bold">Registration Number</label><input type="text" name="regNo" className="form-control" value={formData.regNo} onChange={handleInputChange} /></div>
              <div className="col-md-5"><label className="fw-bold">Course Title</label><input type="text" name="courseName" className="form-control" placeholder="e.g. Full Stack MERN Development" required onChange={handleInputChange} /></div>
              <div className="col-md-3">
                <label className="fw-bold">Awarded Grade</label>
                <select name="grade" className="form-select" onChange={handleInputChange} value={formData.grade}>
                  <option value="A++">A++ (Exceptional)</option>
                  <option value="A+">A+ (Excellent)</option>
                  <option value="A">A (Good)</option>
                </select>
              </div>
              <div className="col-md-3"><label className="fw-bold">From Date</label><input type="date" name="fromDate" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-3"><label className="fw-bold">To Date</label><input type="date" name="toDate" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-3"><label className="fw-bold">Duration</label><input type="text" name="duration" className="form-control" placeholder="6 Months" required onChange={handleInputChange} /></div>
              <div className="col-md-3"><label className="fw-bold">Date of Issue</label><input type="date" name="issueDate" className="form-control" value={formData.issueDate} onChange={handleInputChange} /></div>
              <div className="col-12 mt-4 text-center">
                <button type="submit" className="btn btn-primary px-5 py-2 fw-bold">Preview Professional Design</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className="no-print d-flex justify-content-center gap-3 py-4">
            <button className="btn btn-secondary" onClick={() => setShowCertificate(false)}>Edit Info</button>
            <button className="btn btn-success px-4" onClick={() => window.print()}>Print Official Copy</button>
          </div>

          <div className="cert-a4-landscape">
             {/* THE WATERMARK GRID */}
             <div className="watermark-overlay">
                {[...Array(50)].map((_, i) => (
                    <span key={i}>CYNTAX CODING HUB &nbsp;&nbsp;</span>
                ))}
             </div>

            <div className="outer-gold-frame">
              <div className="inner-navy-frame">
                <div className="cert-content-box text-center">
                  
                  <header className="d-flex justify-content-between align-items-start mb-2">
                    <div className="text-start small fw-bold text-muted">ISO 9001:2015 Certified<br/>MSME Registered Institute</div>
                    <div className="text-end small fw-bold text-muted">Reg No: {formData.regNo}<br/>ID: {formData.certificateNo}</div>
                  </header>

                  <h1 className="display-3 fw-black text-navy m-0">CYNTAX CODING HUB</h1>
                  <p className="text-gold fw-bold letter-spacing-5 mb-1">ADVANCED CENTRE FOR SOFTWARE ENGINEERING</p>
                  <p className="italic-text mb-3">Recognized by Global Educational Standards</p>

                  <div className="title-ribbon-modern">CERTIFICATE OF ACHIEVEMENT</div>

                  <div className="main-paragraph py-4">
                    <p className="m-0 fs-5 italic-text">This document officially validates that</p>
                    <h2 className="student-name-brush">{formData.studentName}</h2>
                    <p className="fs-5">Son / Daughter of <strong>Shri {formData.fatherName}</strong></p>
                    
                    <p className="cert-desc px-5">
                      has successfully demonstrated exceptional proficiency and completed the industrial-grade curriculum in 
                      <span className="text-navy fw-bold fs-4"> {formData.courseName} </span> 
                      for a duration of <strong>{formData.duration}</strong>, effective from 
                      <strong> {formData.fromDate} </strong> to <strong> {formData.toDate} </strong>. 
                      Based on high-performance criteria and practical project submission, the candidate has been 
                      honored with the prestigious Grade of <span className="grade-pill">{formData.grade}</span>.
                    </p>
                  </div>

                  <footer className="footer-layout d-flex justify-content-between align-items-end mt-auto">
                    <div className="footer-meta text-start">
                      <p className="mb-0"><strong>Place:</strong> Shimla, H.P.</p>
                      <p className="mb-0"><strong>Issue Date:</strong> {formData.issueDate}</p>
                    </div>

                    <div className="maroon-official-seal">
                        <div className="seal-border">
                            <span className="seal-initial">CCH</span>
                            <span className="seal-full">CYNTAX CODING HUB</span>
                        </div>
                    </div>

                    <div className="footer-sign text-center">
                      <div className="sign-line"></div>
                      <p className="mb-0 fw-bold">Director</p>
                      <p className="small text-muted m-0">Authorized Signatory</p>
                    </div>
                  </footer>
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