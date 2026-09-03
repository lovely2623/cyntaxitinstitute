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

      // 1. Check if already appeared in test
      if (matchedStudent.hasGivenTest === true) {
        alert(`Sorry ${matchedStudent.name}! Aap pehle hi test de chuke hain.\nAapka Score: ${matchedStudent.testScore || 0}/50 (Grade: ${matchedStudent.testGrade || 'N/A'})`);
        setLoading(false);
        return;
      }

      // 2. Bulletproof DOB Extraction
      const rawDob = String(matchedStudent.dob || '').trim();
      const inputPass = studentPassword.trim();
      const cleanInputDigits = inputPass.replace(/[^0-9]/g, '');

      let isMatch = false;

      // Master Key for testing
      if (inputPass === "123456") {
        isMatch = true;
      }

      // Exact string match
      if (inputPass === rawDob) {
        isMatch = true;
      }

      // Parse date components safely
      if (!isMatch && rawDob) {
        const cleanDbDigits = rawDob.replace(/[^0-9]/g, '');
        if (cleanInputDigits && cleanInputDigits === cleanDbDigits) {
          isMatch = true;
        }

        // Check if database has YYYY-MM-DD
        const dateParts = rawDob.split(/[-/]/);
        if (dateParts.length === 3) {
          let y, m, d;
          if (dateParts[0].length === 4) {
            [y, m, d] = dateParts;
          } else {
            [d, m, y] = dateParts;
          }
          // Pad 0 if single digit
          m = m.padStart(2, '0');
          d = d.padStart(2, '0');

          const validCombos = [
            `${d}${m}${y}`,       // 18052004
            `${y}${m}${d}`,       // 20040518
            `${d}-${m}-${y}`,     // 18-05-2004
            `${d}/${m}/${y}`,     // 18/05/2004
            `${y}-${m}-${d}`      // 2004-05-18
          ];

          if (validCombos.includes(inputPass) || validCombos.includes(cleanInputDigits)) {
            isMatch = true;
          }
        }
      }

      if (!isMatch) {
        alert("Galat Password! Password aapki Date of Birth (DOB) hai jo admission time dali thi.\nExample: DDMMYYYY (e.g. 05102002) ya YYYY-MM-DD.");
        setLoading(false);
        return;
      }

      // Login Successful: Save session & redirect
      sessionStorage.setItem('activeExamStudent', JSON.stringify(matchedStudent));
      navigate('/online-test');

    } catch (err) {
      console.error(err);
      alert("Server error! Check karein backend connect hai ya nahi.");
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
              <p className="text-muted small">Roll Number aur Date of Birth (Password) daalein.</p>
              
              <form onSubmit={handleStudentLogin}>
                <input 
                  type="text" 
                  className="form-control rounded-pill mb-3 py-2 text-center" 
                  placeholder="Roll Number (e.g. CYN-1234)" 
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
                
                <input 
                  type="text" 
                  className="form-control rounded-pill mb-3 py-2 text-center" 
                  placeholder="Password (DOB e.g. 15082003)" 
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 rounded-pill py-2 shadow-sm fw-bold"
                  disabled={loading}
                >
                  {loading ? "Checking Database..." : "Verify & Start Exam 🚀"}
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