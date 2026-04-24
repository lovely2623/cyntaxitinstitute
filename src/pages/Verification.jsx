import React, { useState } from 'react';
import "./Verification.css";

function Verification() {
  const [searchId, setSearchId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/students/verify/${searchId}`);
      const data = await response.json();
      
      if (response.ok) {
        setStudentData(data);
        setSearchId(''); // <--- Ye raha magic, input field automatic blank ho jayegi
      } else {
        alert("Opps! Ye Student ID hamare record mein nahi hai.");
        setStudentData(null);
      }
    } catch (error) {
      alert("Backend server se connection nahi ho paa raha!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    }) : 'N/A';
  };

  return (
    <div className="v-portal-wrapper">
      <div className="container">
        {/* Verification Hero Section */}
        <div className="v-hero-content text-center mb-5">
          <h1 className="display-5 fw-bold text-dark">E-Verification Portal</h1>
          <p className="lead text-secondary">Cyntax Education Official Student Authentication System</p>
        </div>

        {/* Search Box Card */}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="v-search-card">
              <form onSubmit={handleSearch} className="d-flex flex-column gap-3">
                <div className="v-input-group">
                  <i className="fas fa-id-card v-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Enter Student ID (e.g. CYN-1234)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <button type="submit" className="v-verify-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'VERIFY NOW'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Student Profile Display */}
        {studentData && (
          <div className="row justify-content-center mt-5">
            <div className="col-lg-9 animate-profile">
              <div className="v-profile-card">
                <div className="v-card-top-bar"></div>
                <div className="p-4 p-md-5">
                  <div className="row align-items-center">
                    <div className="col-md-4 text-center border-md-end">
                      <div className="v-avatar-wrapper">
                        <img 
                          src={studentData.photo || 'https://via.placeholder.com/200'} 
                          alt="Student" 
                        />
                      </div>
                      <h3 className="fw-bold mt-3 mb-1 text-dark">{studentData.name}</h3>
                      <p className="text-primary fw-semibold mb-0">{studentData.studentId}</p>
                      <div className={`v-status-tag ${studentData.status === 'Active' ? 'active' : 'completed'}`}>
                        {studentData.status || 'Active'}
                      </div>
                    </div>

                    <div className="col-md-8 ps-md-5">
                      <h5 className="v-section-title">Academic Details</h5>
                      <div className="v-info-grid">
                        <div className="v-info-item">
                          <label>Course Name</label>
                          <span>{studentData.course}</span>
                        </div>
                        <div className="v-info-item">
                          <label>Duration</label>
                          <span>{studentData.courseDuration}</span>
                        </div>
                        <div className="v-info-item">
                          <label>Father's Name</label>
                          <span>{studentData.fatherName}</span>
                        </div>
                        <div className="v-info-item">
                          <label>Admission Date</label>
                          <span className="text-success">{formatDate(studentData.joiningDate)}</span>
                        </div>
                        <div className="v-info-item w-100">
                          <label>Verified Address</label>
                          <span>{studentData.address || "Information Not Available"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="v-footer">
                  <p>© 2026 Cyntax Education - Secure Database Access</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verification;