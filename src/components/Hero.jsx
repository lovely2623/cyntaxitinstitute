import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="bg-slider"></div>

      <div className="hero-content">
        <div className="badge-new">
          <span className="live-icon"></span> 
          Limited Seats: Batch 2026-27 starts soon!
        </div>
        
        <h1>Stop Just Learning. <br /><span>Start Building Your Career.</span></h1>
        
        <p>
          Himachal's premier coding hub for <strong>Practical Mastery</strong>. 
          From Steno to Full-Stack Development—get the skills that actually get you hired.
        </p>

        <div className="hero-buttons">
          <Link to="/contact">
            <button className="primary-btn">
              Book A Free Demo <i className="fas fa-rocket"></i>
            </button>
          </Link>
          <Link to="/courses">
            <button className="secondary-btn">View Job-Oriented Courses</button>
          </Link>
        </div>
        
        <div className="hero-trust">
          <div className="trust-item">
            <i className="fas fa-user-graduate"></i>
            <span>500+ Students Trained</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-laptop-code"></i>
            <span>1:1 Mentorship</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-certificate"></i>
            <span>ISO Certified Training</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;