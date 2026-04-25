import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminLayout.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    totalMessages: 0,
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // SECURITY CHECK
  const checkAuth = () => {
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (auth !== 'true') {
      navigate('/Login');
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    if (!checkAuth()) return;
    
    // Refresh dikhane ke liye loading true kar sakte hain, but auto-refresh mein irritates users
    // Isliye initial load pe hi loading state rakhi hai

    try {
      const BASE_URL = 'https://cyntaxitinstitute.onrender.com';

      // Promise.all use karke parallel fetch karenge efficiency ke liye
      const [statsRes, msgRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/stats`),
        fetch(`${BASE_URL}/api/contact/all`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData);
      }

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Har 1 min mein refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <h3 className="mt-3">📊 Fetching Cyntax Data...</h3>
      </div>
    );
  }

  return (
    <div className="admin-dashboard p-3 p-md-4" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="dashboard-header mb-4 text-center text-md-start">
        <h1 className="fw-bold text-dark">Mohit Sir, Aaj ki Report! 👋</h1>
        <p className="text-secondary mb-0">Cyntax IT Institute - Enquiry & Admission Control</p>
      </div>

      {/* Main Stats Cards */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-primary border-5">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-primary-subtle p-3 rounded-circle me-3 d-none d-md-block">
                <i className="fas fa-user-graduate text-primary fs-4"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{stats.totalAdmissions}</h2>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Total Admissions</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 border-start border-warning border-5">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-warning-subtle p-3 rounded-circle me-3 d-none d-md-block">
                <i className="fas fa-envelope-open-text text-warning fs-4"></i>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{stats.totalMessages}</h2>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>New Enquiries</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Messages Section */}
      <div className="messages-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold m-0"><i className="fas fa-comment-dots me-2 text-primary"></i>Student Enquiries</h4>
          <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => { setLoading(true); fetchData(); }}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        <div className="row g-3">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div className="card-header bg-white border-0 pt-3 px-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-bold text-dark mb-0">{msg.name}</h5>
                        <small className="text-primary fw-bold">Interested in: {msg.course?.toUpperCase() || 'General'}</small>
                      </div>
                      <span className="badge bg-light text-dark border shadow-sm">
                        {new Date(msg.date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="card-body px-4">
                    <div className="message-content bg-light p-3 rounded-3 mb-3" style={{ borderLeft: '3px solid #dee2e6' }}>
                      <p className="small mb-0 text-dark italic">"{msg.message}"</p>
                    </div>
                    <div className="contact-details row g-2">
                      <div className="col-sm-6">
                        <a href={`tel:${msg.mobile}`} className="text-decoration-none text-dark small d-block">
                          <i className="fas fa-phone-alt me-2 text-success"></i> {msg.mobile}
                        </a>
                      </div>
                      <div className="col-sm-6">
                        <a href={`mailto:${msg.email}`} className="text-decoration-none text-dark small d-block text-truncate">
                          <i className="fas fa-envelope me-2 text-danger"></i> {msg.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 pb-3 px-4">
                    <a 
                      href={`https://wa.me/91${msg.mobile}?text=Hi ${msg.name}, Cyntax IT Institute se Mohit Sir baat kar raha hoon...`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-success btn-sm w-100 rounded-pill"
                    >
                      <i className="fab fa-whatsapp me-2"></i> WhatsApp Reply
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <div className="bg-white p-5 rounded-4 shadow-sm border">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p className="text-muted fw-bold">Koi enquiry nahi mili hai abhi tak.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;