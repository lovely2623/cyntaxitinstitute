import React from 'react';
import './Mini.css';

function Mini() {
  return (
    <section className='mini-one'>
        {/* Location */}
        <div className='info-item'>
          <i className="fas fa-map-marker-alt"></i>
          <span>Solan</span>
        </div>

        {/* Email - Clickable */}
        <div className='info-item'>
          <a href="mailto:info@cyntaxcodinghub@gmail.com">
            <i className="fas fa-envelope"></i>
            <span>info@cyntaxcodinghub@gmail.com</span>
          </a>
        </div>

        {/* WhatsApp - Clickable */}
        <div className='info-item'>
          <a href="https://wa.me/918988199226" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
            <span>8988199226</span>
          </a>
        </div>
    </section>
  );
}

export default Mini;