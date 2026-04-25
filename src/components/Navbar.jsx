import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/images/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // 1. Check Login Status
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  useEffect(() => {
    const handleScroll = () => {
      // Background color change on scroll logic
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // --- Naya Logic: Scroll hone par menu band ho jaye ---
      if (menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]); // menuOpen ki state yahan monitor ho rahi hai

  // 2. Logout Logic
  const handleLogout = () => {
    if(window.confirm("Mohit Sir, Logout karna hai?")) {
      localStorage.removeItem('isAdminAuthenticated'); // Memory saaf
      navigate('/'); // Seedha Home par
      window.location.reload(); // Refresh taaki Login wapas dikhe
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1>Cyntax IT Institute</h1>
        </div>

        {/* Hamburger Icon */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}> 
          {menuOpen ? "✖" : "☰"} 
        </div>

        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
          <li><NavLink to="/courses" onClick={closeMenu}>Courses</NavLink></li>
          <li><NavLink to="/AboutUs" onClick={closeMenu}>About Us</NavLink></li>
          <li><NavLink to="/ContactUs" onClick={closeMenu}>Contact Us</NavLink></li>
          <li><NavLink to="/Gallery" onClick={closeMenu}>Gallery</NavLink></li>
          <li><NavLink to="/Verification" onClick={closeMenu}>Verification</NavLink></li>

          {/* Login/Logout Switch */}
          {isAuthenticated ? (
            <li>
              <button onClick={handleLogout} className="nav-logout-btn">
                <span className="login-icon">🏃</span>
                <span className="login-text">Logout</span>
              </button>
            </li>
          ) : (
            <li>
              <NavLink to="/Login" onClick={closeMenu} className="login-box">
                <span className="login-icon">👤</span>
                <span className="login-text">Login</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;