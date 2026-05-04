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
    issueDate: '', // Left blank as per request
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
            <h2 className="fw-bold text-navy mb-4 text-center">Cyntax Coding Hub | Certificate Manager</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowCertificate(true); }} className="row g-3">
              <div className="col-md-6"><label className="fw-bold">Student Full Name</label><input type="text" name="studentName" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-6"><label className="fw-bold">Father's Name</label><input type="text" name="fatherName" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-4"><label className="fw-bold">Registration Number</label><input type="text" name="regNo" className="form-control" value={formData.regNo} onChange={handleInputChange} /></div>
              <div className="col-md-5"><label className="fw-bold">Course Title</label><input type="text" name="courseName" className="form-control" placeholder="e.g. MERN Stack Development" required onChange={handleInputChange} /></div>
              <div className="col-md-3">
                <label className="fw-bold">Awarded Grade</label>
                <select name="grade" className="form-select" onChange={handleInputChange} value={formData.grade}>
                  <option value="A++">A++ (Exceptional)</option>
                  <option value="A+">A+ (Excellent)</option>
                  <option value="A">A (Good)</option>
                </select>
              </div>
              <div className="col-md-4"><label className="fw-bold">From Date</label><input type="date" name="fromDate" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-4"><label className="fw-bold">To Date</label><input type="date" name="toDate" className="form-control" required onChange={handleInputChange} /></div>
              <div className="col-md-4"><label className="fw-bold">Duration</label><input type="text" name="duration" className="form-control" placeholder="6 Months" required onChange={handleInputChange} /></div>
              <div className="col-12 mt-4 text-center">
                <button type="submit" className="btn btn-navy px-5 py-2 fw-bold">Generate Professional Certificate</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="preview-container">
          <div className="no-print d-flex justify-content-center gap-3 py-4">
            <button className="btn btn-outline-secondary" onClick={() => setShowCertificate(false)}>Edit Info</button>
            <button className="btn btn-success px-4" onClick={() => window.print()}>Print / Download PDF</button>
          </div>

          {/* START OF A4 CERTIFICATE */}
          <div className="cert-a4-landscape shadow-lg mx-auto" id="printable-cert">
            
            {/* Tiled Watermark */}
            <div className="watermark-grid">
               {[...Array(60)].map((_, i) => (
                   <span key={i} className="watermark-text">CYNTAX CODING HUB</span>
               ))}
            </div>

            <div className="outer-gold-border">
              <div className="inner-border-design">
                
                {/* Header Information */}
                <header className="cert-header d-flex justify-content-between">
                  <div className="header-left">
                    <p>ISO 9001:2015 CERTIFIED</p>
                    <p>REG. NO: {formData.regNo}</p>
                  </div>
                  <div className="header-right text-end">
                    <p>MSME GOVT. OF INDIA REG.</p>
                    <p>CERTIFICATE ID: {formData.certificateNo}</p>
                  </div>
                </header>

                {/* Institute Identity */}
                <div className="institute-section text-center">
                  <div className="logo-placeholder mb-2">
                    {/* Yahan aapka Cyntax Logo aayega */}
                    <div className="logo-circle">CCH</div>
                  </div>
                  <h1 className="institute-name">CYNTAX CODING HUB</h1>
                  <p className="institute-tagline text-uppercase">Center for Advanced Software Engineering & Digital Excellence</p>
                  <div className="divider-gold"></div>
                </div>

                {/* Certificate Body */}
                <div className="cert-body text-center">
                  <h2 className="cert-title">CERTIFICATE OF ACHIEVEMENT</h2>
                  <p className="cert-intro">This is to certify that the prestigious board of examiners has awarded this certificate to</p>
                  
                  <div className="student-name-container">
                    <h3 className="student-name">{formData.studentName}</h3>
                    <div className="name-underline"></div>
                  </div>

                  <p className="parentage">S/o / D/o <strong>Shri {formData.fatherName}</strong></p>

                  <p className="course-details">
                    for the successful completion of the intensive professional course in
                    <br />
                    <span className="course-highlight">{formData.courseName}</span>
                    <br />
                    conducted from <strong>{formData.fromDate}</strong> to <strong>{formData.toDate}</strong> for a duration of <strong>{formData.duration}</strong>.
                  </p>

                  <p className="grade-statement">
                    Having completed all projects and assessments with merit, the candidate is awarded Grade 
                    <span className="grade-badge">{formData.grade}</span>
                  </p>
                </div>

                {/* Footer Section */}
                <footer className="cert-footer d-flex justify-content-between align-items-end">
                  <div className="footer-meta">
                    <p><strong>Place:</strong> .........................</p>
                    <p><strong>Date:</strong> .........................</p>
                  </div>

                  <div className="official-seal-wrapper">
                    <div className="maroon-seal">
                      <div className="seal-inner">
                        <span className="seal-center-text">CCH</span>
                        <div className="seal-circular-text">CYNTAX CODING HUB • SHIMLA • </div>
                      </div>
                    </div>
                  </div>

                  <div className="signature-block text-center">
                    <div className="sign-line"></div>
                    <p className="mb-0 fw-bold">Director</p>
                    <p className="small text-muted">Authorized Signatory</p>
                  </div>
                </footer>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificate;