import React from 'react';
import './Facilities.css';

function Facilities() {
  const facilityData = [
    { id: 1, icon: "fas fa-wifi", title: "Free Internet", desc: "High-speed Wi-Fi campus taaki aap online resources ka pura fayda utha sakein." },
    { id: 2, icon: "fas fa-graduation-cap", title: "Quality Education", desc: "Experienced trainers aur industry-standard syllabus ke saath behtareen shiksha." },
    { id: 3, icon: "fas fa-desktop", title: "Advanced Computer Lab", desc: "Latest technology aur high-configuration systems computer programming ke liye." },
    { id: 4, icon: "fas fa-book-reader", title: "Govt. Job Preparation", desc: "IT exams aur govt. technical posts ke liye special coaching aur guidance." },
    { id: 5, icon: "fas fa-certificate", title: "Valid Certification", desc: "Course pura hone par aapko milega industry-recognized valid certificate." },
    { id: 6, icon: "fas fa-user-tie", title: "Placement Support", desc: "Career counseling aur interview preparation taaki aapko mile achhi job." }
  ];

  return (
    <section className="facilities-section">
      <div className="container">
        <h2 className="section-title">Our Facilities</h2>
        <div className="underline"></div>
        
        <div className="facilities-grid">
          {facilityData.map((item) => (
            <div className="facility-card" key={item.id}>
              <div className="icon-box">
                <i className={item.icon}></i>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Section Added Right Below */}
      <div className="marquee-wrapper">
        <div className="marquee-content">
          <span>Join us to grow your career! Enroll Fast - Limited Seats 🚀</span>
          <span>Join us to grow your career! Enroll Fast - Limited Seats 🚀</span>
          <span>Join us to grow your career! Enroll Fast - Limited Seats 🚀</span>
          <span>Join us to grow your career! Enroll Fast - Limited Seats 🚀</span>
        </div>
      </div>
    </section>
  );
}

export default Facilities;