import React from 'react';
import './ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Koi bhi sawal ho? Beshijhak puchiye! Hum aapki help ke liye hamesha taiyaar hain.</p>
      </div>

      <div className="contact-container">
        {/* Left Side: Contact Info */}
        <div className="contact-info">
          <div className="info-card">
            <i className="fas fa-phone-alt"></i>
            <h3>Call or WhatsApp</h3>
            <p>Career counseling ke liye call karein:</p>
            <a href="tel:+918988199226">+91 89881 99226</a>
          </div>

          <div className="info-card">
            <i className="fas fa-envelope"></i>
            <h3>Email Us</h3>
            <p>Apne documents ya query mail karein:</p>
            <a href="mailto:info@cyntaxinstitute.com">info@cyntaxinstitute.com</a>
          </div>

          <div className="info-card">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Visit Our Center</h3>
            <p>Solan, Himachal Pradesh - 173212</p>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="contact-form-box">
          <h2>Send us a Message</h2>
          <form>
            <div className="input-group">
              <input type="text" placeholder="Aapka Naam" required />
              <input type="email" placeholder="Email Address" required />
            </div>
            <input type="text" placeholder="Mobile Number" required />
            <select required>
              <option value="">Course Choose Karein</option>
              <option value="dca">DCA / PGDCA</option>
              <option value="steno">Steno (Hindi/English)</option>
              <option value="web">Web Development</option>
              <option value="govt">Govt. Exam Preparation</option>
            </select>
            <textarea placeholder="Aapka Sawal (Message)" rows="5"></textarea>
            <button type="submit" className="submit-btn">Send Message 🚀</button>
          </form>
        </div>
      </div>

      {/* Full Width Google Map */}
      <div className="map-section">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.673843516053!2d77.1042738753733!3d30.90342507449551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f840656a8775d%3A0x6e6e2f1f0e0f0e0f!2sSolan%2C%20Himachal%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
          width="100%" 
          height="400" 
          style={{border:0}} 
          allowFullScreen="" 
          loading="lazy"
          title="Cyntax Location"
        ></iframe>
      </div>
    </div>
  );
}

export default ContactUs;