import React from 'react';
import './Gallery.css';

// Photos ko upar import karein
import g1 from '../assets/images/photo1.jpg';
import g2 from '../assets/images/photo2.jpg';
import g3 from '../assets/images/photo3.jpg';
import g4 from '../assets/images/photo4.jpg';
import g5 from '../assets/images/photo5.jpg';
import g6 from '../assets/images/photo6.jpg';
import g7 from '../assets/images/photo7.jpg';
import g8 from '../assets/images/photo8.jpg';

function Gallery() {
  const images = [
    { id: 1, imgSource: g1, title: "Computer Lab", category: "Infrastructure" },
    { id: 2, imgSource: g2, title: "Steno Class", category: "Education" },
    { id: 3, imgSource: g3, title: "Activities", category: "Activities" },
        { id: 4, imgSource: g4, title: "Computer Lab", category: "Infra" },
    { id: 5, imgSource: g5, title: "Steno Class", category: "Education" },
    { id: 6, imgSource: g6, title: "Activities", category: "Activities" },
        { id: 7, imgSource: g7, title: "Computer Lab", category: "Infrastructure" },
    { id: 8, imgSource: g8, title: "Steno Class", category: "Education" },
  ];

  return (
    <div className="gallery-page">
      <div className="gallery-grid">
        {images.map((img) => (
          <div className="gallery-item" key={img.id}>
            <div className="gallery-img-box">
              {/* Ab yahan direct variable pass hoga */}
              <img src={img.imgSource} alt={img.title} />
              <div className="gallery-overlay">
                <h3>{img.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Gallery;