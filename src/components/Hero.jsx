import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import heroImg from '../assets/images/hero.jpg';

function Hero() {
  const phoneNumber = "8988199226";
  const message = "Hi Cyntax Coding Hub, I want to enquire about the upcoming courses.";
  const whatsappLink = `https://wa.me/${+918988199226}?text=${encodeURIComponent(message)}`;

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
<b>"Zero ho? Koi baat nahi! Skills hum sikhayenge.
Zero se HERO banne aur IT mein Career banane ke liye ab kahin aur jaane ki zaroorat nahi, Bas CYNTAX aane ki zaroorat hai!"</b>
              <i>Stop Searching, Start Coding! Career banane ke liye Chandigarh jaane ki zaroorat nahi, Bas Cyntax aane ki zaroorat hai.</i>
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

            <div className="hero-stats-row">
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-text">Courses</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-text">Practical</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-text">Support</span>
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="hero-image-area">
            <div className="image-card">
              <img src={heroImg} alt="Coding at Cyntax" />
              {/* Experience tag removed as requested */}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;