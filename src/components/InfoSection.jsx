import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InfoSection.css';

function InfoSection() {
  const navigate = useNavigate();

  // Instant local cache load so the UI never waits for Render cold-start
  const [newsList, setNewsList] = useState(() => {
    try {
      const cached = localStorage.getItem('cyntax_cached_news');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [pdfList, setPdfList] = useState(() => {
    try {
      const cached = localStorage.getItem('cyntax_cached_pdfs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const BASE_URL = 'https://cyntaxitinstitute.onrender.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, pdfRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/news`, { timeout: 15000 }).catch(() => null),
          axios.get(`${BASE_URL}/api/pdfs`, { timeout: 15000 }).catch(() => null)
        ]);

        if (newsRes && Array.isArray(newsRes.data)) {
          setNewsList(newsRes.data);
          localStorage.setItem('cyntax_cached_news', JSON.stringify(newsRes.data));
        }
        if (pdfRes && Array.isArray(pdfRes.data)) {
          setPdfList(pdfRes.data);
          localStorage.setItem('cyntax_cached_pdfs', JSON.stringify(pdfRes.data));
        }
      } catch (err) {
        console.warn("Background info fetch failed, running on cached data:", err);
      }
    };

    fetchData();
  }, [BASE_URL]);

  return (
    <section className="info-section">
      <div className="info-container">
        
        {/* News Box */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-bullhorn"></i>
            <h2>Latest News</h2>
          </div>
          <div className="marquee-vertical">
            <div className="scroll-content">
              {newsList.length > 0 ? (
                newsList.map((news, index) => (
                  <p key={news._id || index}><span>{news.tag || 'NEW'}</span> {news.text}</p>
                ))
              ) : (
                <p>Loading Latest News...</p>
              )}
              {newsList.length > 3 && newsList.map((news, index) => (
                <p key={`copy-${index}`}><span>{news.tag || 'NEW'}</span> {news.text}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Box */}
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

        {/* Jobs PDF Box */}
        <div className="info-box">
          <div className="box-header">
            <i className="fas fa-file-pdf"></i>
            <h2>Latest Jobs PDF</h2>
          </div>
          <div className="pdf-list">
            {pdfList.length > 0 ? pdfList.map((pdf, index) => (
              <a key={pdf._id || index} href={pdf.link} target="_blank" rel="noreferrer" className="pdf-item">
                <div className="pdf-icon">PDF</div>
                <div className="pdf-text text-truncate">{pdf.title}</div>
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