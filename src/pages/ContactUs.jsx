import React, { useState } from 'react';
import './ContactUs.css';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    course: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("Sending data to backend:", formData); // Debugging ke liye

    try {
      // 1. Agar aap local computer pe chala rahe ho to localhost:5000 hi rahega
      // 2. Agar aapne backend Render pe deploy kiya h, to yahan wo URL aayegi
      const response = await fetch('https://cyntaxitinstitute.onrender.com/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log("Server Response:", result); // Debugging ke liye

      if (response.ok && result.success) {
        alert("Shukriya Mohit Sir! Aapka message database mein save ho gaya hai. 🚀");
        setFormData({ name: '', email: '', mobile: '', course: '', message: '' });
      } else {
        alert("Oops! Server Error: " + (result.error || "Data save nahi hua."));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Backend se baat nahi ho pa rahi! Check karein ki Terminal mein 'Server running on port 5000' likha hai?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Koi bhi sawal ho? Beshijhak puchiye! Hum aapki help ke liye hamesha taiyaar hain.</p>
      </div>

      <div className="contact-container">
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

        <div className="contact-form-box">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="text" 
                name="name" // Backend schema se match hona chahiye
                placeholder="Aapka Naam" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
              <input 
                type="email" 
                name="email" // Backend schema se match hona chahiye
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <input 
              type="text" 
              name="mobile" // Backend schema se match hona chahiye
              placeholder="Mobile Number" 
              value={formData.mobile}
              onChange={handleChange}
              required 
            />
            <select 
              name="course" 
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">Course Choose Karein</option>
              <option value="dca">DCA / PGDCA</option>
              <option value="steno">Steno (Hindi/English)</option>
              <option value="web">Web Development</option>
              <option value="govt">Govt. Exam Preparation</option>
            </select>
            <textarea 
              name="message"
              placeholder="Aapka Sawal (Message)" 
              rows="5"
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Send Message 🚀"}
            </button>
          </form>
        </div>
      </div>

      <div className="map-section">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3429.834416568326!2d77.1065!3d30.9084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDU0JzMwLjIiTiA3N8KwMDYnMjMuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
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