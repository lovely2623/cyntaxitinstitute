import React from 'react';
import './Courses.css';

const courseData = [
  // DCA aur PGDCA sabse pehle
  { 
    id: 7, 
    title: "DCA (Diploma in Computer App.)", 
    duration: "1 Year", 
    category: "Most Popular",
    subjects: ["Computer Basics", "MS Office Suite", "Accounting Basics (Tally)", "Internet Applications"]
  },
  { 
    id: 9, 
    title: "PGDCA", 
    duration: "1 Year", 
    category: "Diploma",
    subjects: ["C/C++ Programming", "DBMS", "System Analysis", "Software Engineering"]
  },
  // Steno uske baad
  { 
    id: 6, 
    title: "Steno (Hindi & English)", 
    duration: "1 Year", 
    category: "Professional",
    subjects: ["Shorthand Theory", "Speed Writing", "Typing (Hindi/Eng)", "Office Procedures"]
  },
  // Baaki saare
  { 
    id: 1, title: "Full Stack Development", duration: "6 Months", category: "Software IT",
    subjects: ["Frontend (React JS)", "Backend (Node.js)", "Database (MongoDB)", "Rest API"]
  },
  { 
    id: 5, title: "JOA IT (Himachal Special)", duration: "Ongoing", category: "Govt. Exam",
    subjects: ["Computer Fundamentals", "Operating Systems", "Networking", "HP General Knowledge"]
  },
  { 
    id: 2, title: "Web Designing", duration: "3 Months", category: "Creative IT",
    subjects: ["HTML5 & CSS3", "Bootstrap 5", "UI/UX Basics", "Responsive Design"]
  },
  { 
    id: 3, title: "Data Analytics", duration: "3 Months", category: "Data Science",
    subjects: ["Advanced Excel", "SQL Database", "Python Basics", "Data Visualization"]
  },
  { 
    id: 4, title: "Power BI", duration: "3 Months", category: "Business Intelligence",
    subjects: ["Data Modeling", "DAX Expressions", "Interactive Dashboards", "Reporting"]
  }
];

function Courses() {
  return (
    <div className="courses-container">
      <header className="courses-header">
        <h1>Our Professional Courses</h1>
        <p>Advance Your Career with Cyntax Coding Hub</p>
        <b>"Zero ho? Koi baat nahi! Skills hum sikhayenge.
Zero se HERO banne aur IT mein Career banane ke liye ab kahin aur jaane ki zaroorat nahi, Bas CYNTAX aane ki zaroorat hai!"</b>
      </header>

      <div className="courses-grid">
        {courseData.map((course) => (
          <div className="course-card" key={course.id}>
            <div className="course-badge">{course.category}</div>
            <div className="card-content">
                <h3>{course.title}</h3>
                <div className="course-detail">
                  <i className="far fa-clock"></i> <b>Duration:</b> {course.duration}
                </div>
                
                <div className="course-subjects">
                  <h4>Syllabus Highlights:</h4>
                  <ul>
                    {course.subjects.map((sub, index) => (
                      <li key={index}><i className="fas fa-check-circle"></i> {sub}</li>
                    ))}
                  </ul>
                </div>
            </div>

            <button className="enroll-now-btn">
              <a href="https://wa.me/918988199226" target="_blank" rel="noreferrer">Enroll Now</a>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;