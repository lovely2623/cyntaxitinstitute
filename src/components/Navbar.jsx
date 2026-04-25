import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/images/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
      if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  const handleLogout = () => {
    if(window.confirm("Mohit Sir, Logout karna hai?")) {
      localStorage.removeItem('isAdminAuthenticated');
      navigate('/');
      window.location.reload();
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src={logo} alt="Logo" className="logo-img" />
          <h1 className="logo-text-branding">Cyntax IT Institute</h1>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}> 
          {menuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>} 
        </div>

        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <li><NavLink to="/" onClick={closeMenu}>Home</NavLink></li>
          <li><NavLink to="/courses" onClick={closeMenu}>Courses</NavLink></li>
          <li><NavLink to="/AboutUs" onClick={closeMenu}>About Us</NavLink></li>
          <li><NavLink to="/ContactUs" onClick={closeMenu}>Contact Us</NavLink></li>
          <li><NavLink to="/Gallery" onClick={closeMenu}>Gallery</NavLink></li>
          <li><NavLink to="/Verification" onClick={closeMenu}>Verification</NavLink></li>

          {isAuthenticated ? (
            <li className="nav-item-special">
              <button onClick={handleLogout} className="nav-logout-btn-premium">
                <i className="fas fa-power-off me-2"></i> Logout
              </button>
            </li>
          ) : (
            <li className="nav-item-special">
              <NavLink to="/Login" onClick={closeMenu} className="nav-login-btn-premium">
                <i className="fas fa-user-shield me-2"></i> Admin 
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;