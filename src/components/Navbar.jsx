import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom'; // useLocation add kiya
import './Navbar.css';
import logo from '../assets/images/logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Location monitor karne ke liye

  // Isse har page change par auth state refresh hogi
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuthenticated') === 'true';
    setIsAuthenticated(auth);
  }, [location]); // Jab bhi URL badlega, ye check karega

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
      localStorage.clear(); // Saara data saaf
      setIsAuthenticated(false);
      navigate('/Login');
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        <div className="logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="logo-img" />
          <h1 className="logo-text-branding">Cyntax IT Institute</h1>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}> 
          {menuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>} 
        </div>

        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/courses" onClick={() => setMenuOpen(false)}>Courses</NavLink></li>
          <li><NavLink to="/AboutUs" onClick={() => setMenuOpen(false)}>About Us</NavLink></li>
          <li><NavLink to="/ContactUs" onClick={() => setMenuOpen(false)}>Contact Us</NavLink></li>
          
          {isAuthenticated ? (
            <li>
              <button onClick={handleLogout} className="nav-logout-btn-premium">
                <i className="fas fa-power-off me-2"></i> Logout
              </button>
            </li>
          ) : (
            <li>
              <NavLink to="/Login" className="nav-login-btn-premium" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-user-shield me-2"></i> Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;