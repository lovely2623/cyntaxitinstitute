import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let logoutTimer;
    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        alert("Session Expired: Security ke liye aapko logout kiya ja raha hai.");
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/Login');
      }, 900000); 
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer(); 

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(logoutTimer);
    };
  }, [navigate]);

  const handleLogout = () => {
    if(window.confirm("Bhai sach mein logout karna hai?")) {
      localStorage.removeItem('isAdminAuthenticated');
      navigate('/Login');
    }
  };

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar shadow">
        <div className="sidebar-brand p-4 text-center">
          <h2 className="fw-bold text-white mb-0">Cyntax Panel</h2>
          <small className="text-white-50">Admin Control Centre</small>
        </div>
        
        <nav className="sidebar-nav mt-3">
          <Link to="/AdminLayout/Dashboard" className={`nav-item ${location.pathname.includes('Dashboard') ? 'active' : ''}`}>
            <i className="fas fa-th-large"></i> Dashboard
          </Link>
          <Link to="/AdminLayout/StudentList" className={`nav-item ${location.pathname.includes('StudentList') ? 'active' : ''}`}>
            <i className="fas fa-user-graduate"></i> Student Database
          </Link>
          <Link to="/AdminLayout/AddStudent" className={`nav-item ${location.pathname.includes('AddStudent') ? 'active' : ''}`}>
            <i className="fas fa-plus-circle"></i> New Admission
          </Link>
          {/* NEW BUTTON: CONTENT MANAGER */}
          <Link to="/AdminLayout/ManageContent" className={`nav-item ${location.pathname.includes('ManageContent') ? 'active' : ''}`}>
            <i className="fas fa-edit"></i> Manage PDFs & News
          </Link>
       
        </nav>
        
        <div className="sidebar-footer p-3">
          <button className="admin-logout-btn w-100 py-2" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main bg-light">
        <header className="admin-top-bar d-flex justify-content-between align-items-center p-3 bg-white shadow-sm mb-4">
            <h5 className="mb-0 fw-bold text-dark">Management Console</h5>
            <div className="admin-profile d-flex align-items-center">
                <span className="me-2 small fw-bold text-muted">Welcome, Mohit Sir</span>
                <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width:'35px', height:'35px'}}>M</div>
            </div>
        </header>
        <div className="admin-content-box px-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;