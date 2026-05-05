import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/images/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Time State
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  // Live Time Update Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setScrolled(true);
      else setScrolled(false);
      if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  const handleLogout = () => {
    if (window.confirm("Mohit Sir, Logout karna hai?")) {
      localStorage.removeItem('isAdminAuthenticated');
      navigate('/');
      window.location.reload();
    }
  };

  const closeMenu = () => setMenuOpen(false);

  // Time format function (09:24 PM)
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <header className={`main-header ${scrolled ? "header-scrolled" : ""}`}>
      {/* --- MINI TOP BAR --- */}
      <section className='mini-top-bar'>
        <div className="top-bar-left-content">
            <div className='info-item'>
              <i className="fas fa-map-marker-alt"></i>
              <span>Solan</span>
            </div>

            <div className='info-item hide-on-mobile'>
              <a href="mailto:cyntaxcodinghub@gmail.com">
                <i className="fas fa-envelope"></i>
                <span>cyntaxcodinghub@gmail.com</span>
              </a>
            </div>

            <div className='info-item'>
              <a href="https://wa.me/+918988199226" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
                <span>8988199226</span>
              </a>
            </div>
        </div>

        {/* Live Time - Hamesha Right End mein rahega */}
        <div className='live-time'>
          <i className="far fa-clock"></i>
          <span>{formatTime(currentTime)}</span>
        </div>
      </section>

      {/* --- MAIN NAVBAR --- */}
      <nav className="navbar-area">
        <div className="nav-container">
          <div className="logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Logo" className="logo-img" />
            <h1 className="logo-text-branding">Cyntax Coding Hub</h1>
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
    </header>
  );
}

export default Navbar;