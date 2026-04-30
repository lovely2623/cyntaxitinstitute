import React from 'react';
import './AboutUs.css';
// Apni photo assets folder mein daal kar yahan import kar lena
 import me from '../assets/images/me.jpg'; 

function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-header">
        <h1>About Cyntax Coding Hub</h1>
        <p>Hum sirf sikhaate nahi, career banate hain.</p>
      </div>

      <div className="about-container">
        {/* Mission & Vision Section */}
        <section className="mission-section">
          <div className="mission-text">
            <h2>Hamara Mission 🎯</h2>
            <p>
              Cyntax Coding ka maksad Himachal ke har youth ko IT sector mein expert banana hai. 
              Aaj ke digital world mein, computer skills sirf zaroorat nahi, balki kamyabi ki chabi hain. 
              Hum provide karte hain high-quality education, advanced labs, aur wahi purana bharosa.
            </p>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><h3>5+</h3><p>Years Experience</p></div>
            <div className="stat-card"><h3>1000+</h3><p>Students Trained</p></div>
            <div className="stat-card"><h3>20+</h3><p>Courses</p></div>
          </div>
        </section>

        {/* Director Message Section */}
        <section className="director-section">
          <div className="director-card">
            <div className="director-image">
               {/* Agar photo na ho toh ye dummy icon dikhega */}
               {/* <i className="fas fa-user-tie"></i>  */}
               { <img src={me} alt="Director Mohit" /> }
            </div>
            <div className="director-text">
              <span className="quote-icon">“</span>
              <h2>Director's Message</h2>
              <p>
                "Namaste! Mera naam **Mohit** hai. Maine Cyntax Coding Hub ki shuruat is soch ke sath ki thi ki 
                Solan aur aas-paas ke ilako ke bacho ko wahi advanced level ki computer training mil sake jo bade shehro mein milti hai. 
                Humne pichle 5 saalo mein dekha hai ki kaise sahi guidance ek bache ki life badal sakti hai. 
                Hamare yahan hum DCA ho ya Steno, har bache pe personal dhyan dete hain. 
                Aaiye, humare sath judiye aur apne sapno ko udaan dijiye."
              </p>
              <div className="signature">
                <h4> Lovely Mohit Thakur</h4>
                <p>Founder & Director, Cyntax Coding Hub</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;