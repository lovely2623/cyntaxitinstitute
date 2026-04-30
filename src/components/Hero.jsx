import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import heroImg from '../assets/images/hero.jpg'; // Path check kar lena

function Hero() {
  const phoneNumber = "8988199226";
  const message = "Hi Cyntax Coding Hub, I want to enquire about the upcoming courses.";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-wrapper">
          
          {/* Left Side: Text Content */}
          <div className="hero-text-area">
            <div className="status-badge">✨ Skill Up Like A Pro</div>
            <h1 className="hero-title">
              Level Up Your <span className="text-gradient">Future</span> <br /> 
              With Cyntax Hub.
            </h1>
            <p className="hero-subtitle">
              No more boring lectures. Get hands-on experience in <b>Web Dev, Steno, and DCA</b>. 
              Solan's #1 hub for the next gen of creators.
            </p>

            <div className="hero-cta-group">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="enquire-btn">
                Enquire Now <i className="fab fa-whatsapp"></i>
              </a>
              <Link to="/courses" className="view-courses-btn">
                View Courses
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat"><b>10+</b> Courses</div>
              <div className="stat"><b>100%</b> Practical</div>
              <div className="stat"><b>24/7</b> Support</div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="hero-image-area">
            <div className="image-card">
              <img src={heroImg} alt="Coding at Cyntax" />
              <div className="experience-tag">Since 2018</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;