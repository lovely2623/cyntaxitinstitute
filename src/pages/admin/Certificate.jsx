import React, { useState } from 'react';
import './Certificate.css';
import logoImg from '../../assets/images/logo.png';
import msmeImg from '../../assets/images/msme.jpg';
import isoImg from '../../assets/images/iso.jpg';

function Certificate({ preFillData, onSuccess }) {
  const [formData, setFormData] = useState({
    studentName: preFillData?.certificateDetails?.studentName || preFillData?.name || '',
    fatherName: preFillData?.certificateDetails?.fatherName || preFillData?.fatherName || '',
    regNo: preFillData?.certificateDetails?.regNo || preFillData?.studentId || '',
    courseName: preFillData?.certificateDetails?.courseName || preFillData?.course || '',
    fromDate: preFillData?.certificateDetails?.fromDate || '',
    toDate: preFillData?.certificateDetails?.toDate || '',
    duration: preFillData?.certificateDetails?.duration || preFillData?.courseDuration || '',
    grade: preFillData?.certificateDetails?.grade || 'A++',
    issueDate: preFillData?.certificateDetails?.issueDate || new Date().toISOString().split('T')[0]
  });

  const [showCertificate, setShowCertificate] = useState(preFillData?.isCertificateIssued || false);

  const handleSaveAndPrint = async () => {
    try {
      const response = await fetch(`https://cyntaxitinstitute.onrender.com/api/students/issue-certificate/${preFillData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateDetails: formData })
      });

      // Blank Screen Fix: Use a slight delay to ensure UI is ready
      setTimeout(() => {
        window.print();
        if (response.ok && onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      window.print();
    }
  };

  return (
    <div className="certificate-portal">
      {!showCertificate ? (
        <div className="container py-3 no-print">
          <form onSubmit={(e) => { e.preventDefault(); setShowCertificate(true); }} className="row g-2 bg-light p-3 rounded-3 border">
             <div className="col-md-6"><label className="small fw-bold">Full Name</label><input type="text" className="form-control form-control-sm" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} required /></div>
             <div className="col-md-6"><label className="small fw-bold">Father's Name</label><input type="text" className="form-control form-control-sm" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} required /></div>
             <div className="col-md-4"><label className="small fw-bold">Course</label><input type="text" className="form-control form-control-sm" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} required /></div>
             <div className="col-md-4"><label className="small fw-bold">Duration</label><input type="text" className="form-control form-control-sm" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required /></div>
             <div className="col-md-4">
                <label className="small fw-bold">Grade</label>
                <select className="form-select form-select-sm" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    <option value="A++">A++</option><option value="A+">A+</option><option value="A">A</option>
                </select>
             </div>
             <div className="col-md-6"><label className="small fw-bold">From Date</label><input type="date" className="form-control form-control-sm" value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} required /></div>
             <div className="col-md-6"><label className="small fw-bold">To Date</label><input type="date" className="form-control form-control-sm" value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} required /></div>
             <div className="col-12 text-center mt-3"><button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">Generate Preview</button></div>
          </form>
        </div>
      ) : (
        <div className="preview-wrapper">
          <div className="no-print d-flex justify-content-center gap-3 mb-4 mt-2">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCertificate(false)}>Edit Details</button>
            <button className="btn btn-success btn-sm px-4 fw-bold shadow" onClick={handleSaveAndPrint}><i className="fas fa-print me-1"></i> Save & Print PDF</button>
          </div>

          <div id="printable-area" className="cert-landscape-a4">
            <div className="cert-bg-logo-watermark"><img src={logoImg} alt="" /></div>
            <div className="master-border">
              <div className="inner-gold-frame">
                <header className="cert-header">
                  <div className="header-top-row">
                    <div className="meta-info"><strong>REG. NO:</strong> {formData.regNo}</div>
                    <div className="gov-badges-container">
                        <div className="badge-box"><img src={msmeImg} alt="MSME" className="mini-badge" /><span>MSME Regd.</span></div>
                        <div className="badge-box"><img src={isoImg} alt="ISO" className="mini-badge" /><span>ISO 9001:2008</span></div>
                    </div>
                  </div>
                </header>

                <div className="brand-section text-center">
                  <img src={logoImg} alt="Cyntax Logo" className="main-cert-logo" />
                  <h1 className="main-title">CYNTAX CODING HUB</h1>
                  <p className="sub-title">CENTRE FOR ADVANCED COMPUTING & SOFTWARE DEVELOPMENT</p>
                  <div className="divider-line"><span className="dot"></span></div>
                </div>

                <div className="content-body text-center">
                  <h2 className="title-ribbon">CERTIFICATE OF COMPLETION</h2>
                  <div className="pro-narrative">
                    This is to formally validate that Mr./Ms./Mrs. <u><strong>{formData.studentName}</strong></u>, 
                    S/o D/o <strong>Shri <u>{formData.fatherName} </u></strong>, has successfully 
                    attained proficiency in <u><strong>{formData.courseName}</strong></u>. 
                    The candidate has demonstrated exceptional technical expertise from <u><strong>{formData.fromDate}</strong></u> to 
                    <u><strong> {formData.toDate}</strong></u> for a duration of <u><strong>{formData.duration}</strong></u>. 
                    Awarded the Grade of <u><span className="grade-pill">{formData.grade}</span></u>.
                  </div>
                </div>

                <footer className="cert-footer">
                  <div className="footer-col text-start"><p><strong>Place:</strong> Shimla, HP</p><p><strong>Date:</strong> {new Date(formData.issueDate).toLocaleDateString()}</p></div>
                  <div className="seal-center"><div className="official-maroon-seal"><span className="seal-text">CCH</span></div></div>
                  <div className="footer-col text-center"><div className="signature-line"></div><p className="m-0 fw-bold">Director</p><p className="tiny-text m-0">Authorized Signatory</p></div>
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