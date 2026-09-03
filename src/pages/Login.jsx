import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  // Student Portal Inputs
  const [rollNo, setRollNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (auth === 'true') {
      navigate('/AdminLayout/Dashboard');
    }
  }, [navigate]);

  const handleAdminLogin = () => {
    if (!email || !password) {
      alert("Pehle details toh bharo Mohit Sir!");
      return;
    }

    if (email === 'admin@test.com' && password === '123456') {
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('lastLogin', new Date().getTime());
      navigate('/AdminLayout/Dashboard');
    } else {
      alert('Galat user ya password hai!');
    }
  };

 const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!rollNo.trim() || !studentPassword.trim()) {
      alert("Roll Number aur Password (DOB) dono enter karein!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/students`, { cache: 'no-cache' });
      const students = await response.json();

      const matchedStudent = students.find(
        (s) => s.studentId && s.studentId.trim().toUpperCase() === rollNo.trim().toUpperCase()
      );

      if (!matchedStudent) {
        alert("Ye Roll Number database mein nahi mila! Sahi Roll No daalein.");
        setLoading(false);
        return;
      }

      // --- SMART DOB VERIFICATION ---
      const rawDob = (matchedStudent.dob || '').trim(); // Format: e.g. "2004-05-18"
      const inputPass = studentPassword.trim();
      const cleanInput = inputPass.replace(/[^0-9]/g, ''); // Digits only from input

      let isDobMatched = false;

      // 1. Direct match (e.g. user typed exactly "2004-05-18")
      if (inputPass === rawDob) {
        isDobMatched = true;
      }

      // 2. Parse database YYYY-MM-DD into components
      if (!isDobMatched && rawDob.includes('-')) {
        const parts = rawDob.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts;
          
          const format_YYYYMMDD = `${year}${month}${day}`; // 20040518
          const format_DDMMYYYY = `${day}${month}${year}`; // 18052004
          const format_DMMYYYY  = `${parseInt(day, 10)}${parseInt(month, 10)}${year}`;

          if (
            cleanInput === format_YYYYMMDD ||
            cleanInput === format_DDMMYYYY ||
            cleanInput === format_DMMYYYY ||
            inputPass === `${day}-${month}-${year}` ||
            inputPass === `${day}/${month}/${year}`
          ) {
            isDobMatched = true;
          }
        }
      }

      // 3. Fallback direct digit match
      if (!isDobMatched) {
        const cleanDb = rawDob.replace(/[^0-9]/g, '');
        if (cleanDb && cleanInput === cleanDb) {
          isDobMatched = true;
        }
      }

      // Testing Master Bypass (123456)
      if (!isDobMatched && inputPass !== "123456") {
        alert(`Galat Password! Password aapki Date of Birth hai. Example: DDMMYYYY ya YYYY-MM-DD.`);
        setLoading(false);
        return;
      }

      if (matchedStudent.hasGivenTest) {
        alert(`Aap pehle hi test de chuke hain! Score: ${matchedStudent.testScore || 0}/50`);
        setLoading(false);
        return;
      }

      // Success
      sessionStorage.setItem('activeExamStudent', JSON.stringify(matchedStudent));
      navigate('/online-test');
    } catch (err) {
      console.error(err);
      alert("Server connection fail! Thodi der baad dubara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center" style={{minHeight: '100vh', background: '#f0f2f5'}}>
      <div className="login-card shadow-lg border-0 bg-white overflow-hidden" style={{maxWidth: '450px', width: '90%', borderRadius: '20px'}}>
        <div className="auth-toggle d-flex bg-light p-2 m-3 rounded-pill">
          <button className={`btn flex-fill rounded-pill ${!isAdmin ? "btn-dark" : ""}`} onClick={() => setIsAdmin(false)}>Student</button>
          <button className={`btn flex-fill rounded-pill ${isAdmin ? "btn-dark" : ""}`} onClick={() => setIsAdmin(true)}>Administrator</button>
        </div>

        <div className="login-body p-4 pt-2">
          {!isAdmin ? (
            <div className="auth-section text-center">
              <i className="fas fa-user-graduate fa-3x text-primary mb-3"></i>
              <h3 className="fw-bold">Student Exam Portal</h3>
              <p className="text-muted small">Apna Roll Number aur Password (DOB) daalein.</p>
              
              <form onSubmit={handleStudentLogin}>
                <input 
                  type="text" 
                  className="form-control rounded-pill mb-3 py-2 text-center" 
                  placeholder="Roll Number (e.g. CYN-101)" 
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
                
                <input 
                  type="password" 
                  className="form-control rounded-pill mb-3 py-2 text-center" 
                  placeholder="Password (DOB e.g. 2002-11-04)" 
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 rounded-pill py-2 shadow-sm fw-bold"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Launch Exam 🚀"}
                </button>
              </form>
            </div>
          ) : (
            <div className="auth-section">
              <div className="text-center mb-4">
                <i className="fas fa-lock fa-3x text-dark mb-3"></i>
                <h3 className="fw-bold">Admin Login</h3>
                <p className="text-muted small">Cyntax Management Access</p>
              </div>
              
              <div className="mb-3">
                <label className="small fw-bold text-muted ps-2">Email Address</label>
                <input 
                  type="email" 
                  className="form-control rounded-pill py-2" 
                  placeholder="name@cyntax.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div className="mb-4 position-relative">
                <label className="small fw-bold text-muted ps-2">Security Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  className="form-control rounded-pill py-2" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <i 
                  className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                  style={{right: '15px', top: '38px', cursor: 'pointer', color: '#666'}} 
                  onClick={() => setShowPass(!showPass)} 
                ></i>
              </div>

              <button className="btn btn-dark w-100 rounded-pill py-2 mb-2 shadow fw-bold" onClick={handleAdminLogin}>
                Verify & Enter Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;