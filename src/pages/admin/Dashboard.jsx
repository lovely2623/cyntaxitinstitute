import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Navigation ke liye
import '../admin/AdminLayout.css';

const TOTAL_AVAILABLE_COURSES = 8; 

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    totalCourses: 0,
    recentAdmissions: []
  });
  const [loading, setLoading] = useState(true);

  // SECURITY CHECK: Page load hote hi session check karo
  const checkAuth = () => {
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (auth !== 'true') {
      alert("⚠️ Error: Session Expired! Please login again.");
      navigate('/Login');
      return false;
    }
    return true;
  };

  const fetchStats = async () => {
    if (!checkAuth()) return; // Security Guard

    try {
      const res = await fetch('https://cyntaxitinstitute.onrender.com/api/admin/stats');
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return <div className="p-5 text-center" style={{color: '#000'}}><h3>📊 Connecting to Cyntax DB...</h3></div>;

  const statCards = [
    { id: 1, title: "Total Admissions", count: stats.totalAdmissions, icon: "fa-users", color: "#0000FF" },
    { id: 2, title: "Active Courses", count: TOTAL_AVAILABLE_COURSES, icon: "fa-book-open", color: "#22c55e" },
    { id: 3, title: "Academic Session", count: "2026", icon: "fa-calendar-check", color: "#f59e0b" }
  ];

  return (
    <div className="admin-dashboard fade-in p-4" style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
      <div className="dashboard-header mb-5">
        <h1 className="fw-bold" style={{ color: '#000000', marginBottom: '10px' }}>Mohit Sir, Aaj ki Report! 👋</h1>
        <p className="fw-bold" style={{ color: '#444444' }}>Cyntax IT Institute - Live Analytics Dashboard</p>
      </div>

      <div className="stats-grid row g-4">
        {statCards.map(item => (
          <div className="col-md-4" key={item.id}>
            <div className="stat-card shadow-sm bg-white p-4 rounded-4 border-start border-5" style={{ borderColor: item.color }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-0" style={{ color: '#000000', fontSize: '2.5rem' }}>{item.count}</h2>
                  <p className="fw-bold mb-0" style={{ color: '#333333', textTransform: 'uppercase', fontSize: '0.9rem' }}>{item.title}</p>
                </div>
                <i className={`fas ${item.icon} fa-2x`} style={{ color: item.color, opacity: '0.5' }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold" style={{ color: '#000000' }}><i className="fas fa-history me-2"></i>Latest Admissions</h3>
          <button className="btn btn-dark btn-sm rounded-pill px-4 shadow-sm" onClick={fetchStats}>Manual Sync</button>
        </div>

        <div className="bg-white shadow-sm rounded-4 overflow-hidden border">
          {stats.recentAdmissions.length > 0 ? (
            stats.recentAdmissions.map((s) => (
              <div key={s._id} className="d-flex justify-content-between align-items-center p-4 border-bottom bg-white item-hover">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle bg-light p-3 rounded-circle me-3" style={{border: '1px solid #eee'}}>
                    <i className="fas fa-user text-dark"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#000000' }}>{s.name}</h5>
                    <small className="fw-bold" style={{ color: '#6610f2' }}>Enrolled in {s.course}</small>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-dark text-white p-2 mb-1 d-block shadow-sm" style={{fontSize: '0.85rem'}}>
                    {formatTime(s.joiningDate)}
                  </span>
                  <small className="fw-bold text-black-50">{new Date(s.joiningDate).toLocaleDateString('en-GB')}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <p className="fw-bold" style={{ color: '#000000' }}>No recent admissions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;