import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Navigate import karo
import './InfoSection.css';

function InfoSection() {
  const navigate = useNavigate(); // 2. Hook ko initialize karo

  return (
    <section className="info-section">
      <div className="info-container">
        
        {/* Latest News Box (Pehle wala same rahega) */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-bullhorn"></i>
            <h2>Latest News</h2>
          </div>
          <div className="marquee-vertical">
            <div className="scroll-content">
              <p><span>NEW</span> Admission Open for 2026 Batch</p>
              <p><span>HOT</span> New Web Development Course Added</p>
              <p><span>FREE</span> Demo Classes Available Now</p>
              <p><span>TEST</span> Scholarship Test on Sunday</p>
              <p><span>NEW</span> Admission Open for 2026 Batch</p>
              <p><span>HOT</span> New Web Development Course Added</p>
            </div>
          </div>
        </div>

        {/* Featured Courses Box */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-graduation-cap"></i>
            <h2>Popular Courses</h2>
          </div>
          <ul className="custom-list">
            <li><i className="fas fa-code"></i> Web Development</li>
            <li><i className="fab fa-python"></i> Python Programming</li>
            <li><i className="fas fa-layer-group"></i> Full Stack Development</li>
            <li><i className="fab fa-react"></i> React JS Specialization</li>
          </ul>
          
          {/* 3. Button pe onClick function lagao */}
          <button 
            className="view-all-btn" 
            onClick={() => navigate('/courses')}
          >
            View All Courses <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        {/* Jobs PDF Box (Pehle wala same rahega) */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-file-pdf"></i>
            <h2>Latest Jobs PDF</h2>
          </div>
          <div className="pdf-list">
            <a href="/pdfs/aicte.pdf" target="_blank" rel="noreferrer" className="pdf-item">
              <div className="pdf-icon">PDF</div>
              <div className="pdf-text">AICTE Notification 2026</div>
            </a>
            <a href="/pdfs/incc.pdf" target="_blank" rel="noreferrer" className="pdf-item">
              <div className="pdf-icon">PDF</div>
              <div className="pdf-text">New Hiring Alert!</div>
            </a>
            <a href="/pdfs/Cvramp.pdf" target="_blank" rel="noreferrer" className="pdf-item">
              <div className="pdf-icon">PDF</div>
              <div className="pdf-text">Important Job Update</div>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

export default InfoSection;