import React, { useState, useEffect, useRef } from 'react';
import './Footer.css';

function Footer() {
  const [visitorCount, setVisitorCount] = useState("...");
  // Strict mode mein do baar call hone se rokne ke liye
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!hasCalled.current) {
      fetch('https://cyntaxitinstitute.onrender.com/api/visitors/hit')
        .then(res => res.json())
        .then(data => {
          setVisitorCount(data.count.toLocaleString());
          hasCalled.current = true; // API call ho chuki hai
        })
        .catch(err => {
          console.error("Error:", err);
          setVisitorCount("1,000");
        });
    }
  }, []);

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
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
            <a href="https://wa.me/918988199226"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="footer-box">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Section 3: Contact & Map */}
        <div className="footer-box">
          <h3>Get In Touch</h3>
          <p><i className="fas fa-map-marker-alt"></i> Solan, Himachal Pradesh</p>
          <p><i className="fas fa-phone"></i> +91 89881 99226</p>
          
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=YOUR_REAL_MAP_URL" 
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
             <i className="fas fa-eye"></i> Visitors: <span>{visitorCount}</span>
          </div>
          <p className="maintained-by">Maintained by <a href="#">Cyntax IT Team</a></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;