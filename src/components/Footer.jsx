import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Navigation ke liye Link import kiya
import './Footer.css';

function Footer() {
  const [visitorCount, setVisitorCount] = useState("...");
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      fetch('https://cyntaxitinstitute.onrender.com/api/visitors/hit')
        .then(res => res.json())
        .then(data => {
          setVisitorCount(data.count.toLocaleString());
          hasCalled.current = true;
        })
        .catch(err => {
          console.error("Error:", err);
          setVisitorCount("1,000");
        });
    }
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* Section 1: Institute Info */}
        <div className="footer-box">
          <h3>Cyntax IT Institute</h3>
          <p>Sahi disha, sahi bhavishya. Hum dete hain aapko IT sector mein grow karne ki best training.
            Aaj hi judiye hmare sath or apne sapno ko dijiye ek nayi udaan. When it comes to career enroll in Cyntax Only.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>
            <a href="https://wa.me/918988199226" target="_blank" rel="noreferrer"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>

        {/* Section 2: Quick Links (Updated with <Link>) */}
        <div className="footer-box">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
            <li><Link to="/courses" onClick={scrollToTop}>Courses</Link></li>
            <li><Link to="/AboutUs" onClick={scrollToTop}>About Us</Link></li>
            <li><Link to="/ContactUs" onClick={scrollToTop}>Contact Us</Link></li>
            <li><Link to="/Gallery" onClick={scrollToTop}>Gallery</Link></li>
          </ul>
        </div>

        {/* Section 3: Contact & Map */}
        <div className="footer-box">
          <h3>Get In Touch</h3>
          <p><i className="fas fa-map-marker-alt"></i> Solan, Himachal Pradesh</p>
          <p><i className="fas fa-phone"></i> +91 89881 99226</p>
          
          <div className="map-container shadow-sm rounded overflow-hidden mt-2">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.457813589632!2d77.1085!3d30.9084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDU0JzMwLjIiTiA3N8KwMDYnMzAuNiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
              width="100%" 
              height="150" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Cyntax Location"
            ></iframe>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="bottom-container">
          <p>© {new Date().getFullYear()} <b>Cyntax IT Institute</b>. All Rights Reserved.</p>
          <div className="visitor-count">
             <i className="fas fa-eye text-primary"></i> Visitors: <span className="fw-bold">{visitorCount}</span>
          </div>
          <p className="maintained-by">Maintained by <a href="https://wa.me/918988199226" className="text-decoration-none">Lovely Mohit Thakur</a></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;