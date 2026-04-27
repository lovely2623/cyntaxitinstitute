import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to install axios
import './InfoSection.css';

function InfoSection() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [pdfList, setPdfList] = useState([]);

  useEffect(() => {
    // Fetch News and PDFs from Backend
    const fetchData = async () => {
      try {
        const newsRes = await axios.get('http://localhost:5000/api/news');
        const pdfRes = await axios.get('http://localhost:5000/api/pdfs');
        setNewsList(newsRes.data);
        setPdfList(pdfRes.data);
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="info-section">
      <div className="info-container">
        
        {/* Latest News Box (Dynamic) */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-bullhorn"></i>
            <h2>Latest News</h2>
          </div>
          <div className="marquee-vertical">
            <div className="scroll-content">
              {newsList.length > 0 ? newsList.map((news, index) => (
                <p key={index}><span>{news.tag}</span> {news.text}</p>
              )) : (
                <p>Loading Latest News...</p>
              )}
              {/* Infinite scroll ke liye loop (optional) */}
              {newsList.map((news, index) => (
                <p key={`copy-${index}`}><span>{news.tag}</span> {news.text}</p>
              ))}
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
          <button className="view-all-btn" onClick={() => navigate('/courses')}>
            View All Courses <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        {/* Jobs PDF Box (Dynamic) */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-file-pdf"></i>
            <h2>Latest Jobs PDF</h2>
          </div>
          <div className="pdf-list">
            {pdfList.length > 0 ? pdfList.map((pdf, index) => (
              <a key={index} href={pdf.link} target="_blank" rel="noreferrer" className="pdf-item">
                <div className="pdf-icon">PDF</div>
                <div className="pdf-text">{pdf.title}</div>
              </a>
            )) : (
              <p className="p-3 text-muted">No PDFs available.</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

export default InfoSection;