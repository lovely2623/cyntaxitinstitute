import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      {/* Moving Background with Overlay */}
      <div className="hero-overlay"></div>
      <div className="bg-slider"></div>

      <div className="hero-content">
        <div className="badge-new">🚀 Admissions Open 2026-27</div>
        <h1>Shape Your Future with <br /><span>Cyntax IT Institute</span></h1>
        <p>Expert-led training in Steno, DCA, Web Development & Govt. Exams. <br /> 
           Join Solan's most trusted IT learning hub.</p>

        <div className="hero-buttons">
          <Link to="/contact">
            <button className="primary-btn">Get Started Now <i className="fas fa-arrow-right"></i></button>
          </Link>
          <Link to="/courses">
            <button className="secondary-btn">Explore Courses</button>
          </Link>
        </div>
        
        {/* Chhote trust badges */}
        <div className="hero-trust">
          <span><i className="fas fa-check-circle"></i> Registered Institute</span>
          <span><i className="fas fa-check-circle"></i> Expert Trainers</span>
          <span><i className="fas fa-check-circle"></i> 100% Practical</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;