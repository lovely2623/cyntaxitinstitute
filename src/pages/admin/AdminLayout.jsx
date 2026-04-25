import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();

  // Logout handle karne ke liye function
  const handleLogout = () => {
    if(window.confirm("Bhai sach mein logout karna hai?")) {
      localStorage.removeItem('isAdminAuthenticated');
      navigate('/Login');
    }
  };

  return (
    <div className="admin-wrapper">
      {/* Sidebar Section */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>Cyntax Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/AdminLayout/Dashboard" className="nav-item">
            <i className="fas fa-chart-line"></i> Dashboard
          </Link>
          <Link to="/AdminLayout/StudentList" className="nav-item">
            <i className="fas fa-users"></i> All Students
          </Link>
          <Link to="/AdminLayout/AddStudent" className="nav-item">
            <i className="fas fa-user-plus"></i> New Admission
          </Link>
          <Link to="/AdminLayout/results" className="nav-item">
            <i className="fas fa-poll-h"></i> Exam Results
          </Link>
        </nav>
        
        {/* Logout Button updated */}
        <button className="admin-logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </aside>

      {/* Main Content Section */}
      <main className="admin-main">
        <div className="admin-content-box">
          <Outlet /> {/* Yahan par alag alag pages load honge */}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;