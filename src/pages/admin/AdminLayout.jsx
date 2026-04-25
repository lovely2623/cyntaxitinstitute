import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- 1. SECURITY GUARD: Strict Login Check ---
  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (auth !== 'true') {
      // Agar login nahi hai toh seedha dhakke maar ke bahar
      navigate('/Login');
    }
  }, [navigate, location]);

  // --- 2. AUTO-LOGOUT LOGIC: 15 Minutes Inactivity ---
  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      
      // 15 Minutes = 900,000 milliseconds
      logoutTimer = setTimeout(() => {
        alert("🛡️ Security Alert: Aapka session expire ho gaya hai. Dobara login karein.");
        handleLogoutAction();
      }, 900000); 
    };

    // User activity monitor karne ke liye events
    const activityEvents = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Timer shuru karein

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(logoutTimer);
    };
  }, [navigate]);

  // --- 3. LOGOUT FUNCTION ---
  const handleLogoutAction = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('lastLogin');
    navigate('/Login');
    window.location.reload(); // State puri tarah clean karne ke liye
  };

  const confirmLogout = () => {
    if (window.confirm("Mohit Sir, kya aap sach mein logout karna chahte hain?")) {
      handleLogoutAction();
    }
  };

  return (
    <div className={`admin-wrapper ${isSidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar shadow-lg">
        <div className="sidebar-brand d-flex align-items-center justify-content-center p-4">
          <div className="brand-icon bg-white text-primary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}}>
            <i className="fas fa-user-shield"></i>
          </div>
          <h3 className="fw-bold text-white mb-0">Cyntax Admin</h3>
        </div>

        <nav className="sidebar-nav px-2 mt-3">
          <Link 
            to="/AdminLayout/Dashboard" 
            className={`nav-item ${location.pathname.includes('Dashboard') ? 'active' : ''}`}
          >
            <i className="fas fa-th-large"></i> <span>Dashboard</span>
          </Link>

          <Link 
            to="/AdminLayout/StudentList" 
            className={`nav-item ${location.pathname.includes('StudentList') ? 'active' : ''}`}
          >
            <i className="fas fa-user-graduate"></i> <span>Student Database</span>
          </Link>

          <Link 
            to="/AdminLayout/AddStudent" 
            className={`nav-item ${location.pathname.includes('AddStudent') ? 'active' : ''}`}
          >
            <i className="fas fa-plus-circle"></i> <span>New Admission</span>
          </Link>

          <Link 
            to="/AdminLayout/results" 
            className={`nav-item ${location.pathname.includes('results') ? 'active' : ''}`}
          >
            <i className="fas fa-file-alt"></i> <span>Exam Results</span>
          </Link>

          <Link 
            to="/ContactUs" 
            className="nav-item mt-2 border-top border-secondary pt-3"
          >
            <i className="fas fa-external-link-alt"></i> <span>View Main Site</span>
          </Link>
        </nav>

        <div className="sidebar-footer p-3 mt-auto">
          <button className="btn btn-danger w-100 rounded-pill shadow-sm py-2" onClick={confirmLogout}>
            <i className="fas fa-power-off me-2"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header shadow-sm bg-white d-flex justify-content-between align-items-center px-4 py-2 mb-4">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-light border me-3 d-md-none" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
            <h5 className="mb-0 fw-bold text-secondary d-none d-sm-block">Cyntax IT Institute Management</h5>
          </div>

          <div className="admin-profile-info d-flex align-items-center">
            <div className="text-end me-3 d-none d-md-block">
              <p className="mb-0 fw-bold text-dark small">Mohit Sir</p>
              <small className="text-success fw-bold" style={{fontSize: '0.7rem'}}>● Online Now</small>
            </div>
            <div className="avatar-circle bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '40px', height: '40px'}}>
              M
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="admin-body-content px-3 px-md-4 pb-5">
          <div className="fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;