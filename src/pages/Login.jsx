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

  const checkDobMatch = (dbDobRaw, userPassRaw) => {
    if (!dbDobRaw || !userPassRaw) return false;
    const inputClean = String(userPassRaw).trim();
    const inputDigits = inputClean.replace(/[^0-9]/g, '');

    if (inputClean === "123456") return true;

    const dbClean = String(dbDobRaw).trim();
    if (inputClean.toLowerCase() === dbClean.toLowerCase()) return true;

    const normalizedDb = dbClean.split('T')[0];
    if (inputClean === normalizedDb) return true;

    let d = '', m = '', y = '';
    const parts = normalizedDb.split(/[-/.]/);

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = parts[0]; m = parts[1]; d = parts[2];
      } else {
        d = parts[0]; m = parts[1]; y = parts[2];
      }
    } else {
      const digitsOnlyDb = dbClean.replace(/[^0-9]/g, '');
      if (digitsOnlyDb === inputDigits) return true;
      if (digitsOnlyDb.length === 8) {
        y = digitsOnlyDb.substring(0, 4);
        m = digitsOnlyDb.substring(4, 6);
        d = digitsOnlyDb.substring(6, 8);
      }
    }

    if (d && m && y) {
      const dPadded = d.padStart(2, '0');
      const mPadded = m.padStart(2, '0');
      const dSingle = String(parseInt(d, 10));
      const mSingle = String(parseInt(m, 10));

      const matchPatterns = [
        `${dPadded}${mPadded}${y}`,
        `${y}${mPadded}${dPadded}`,
        `${dSingle}${mSingle}${y}`,
        `${dPadded}-${mPadded}-${y}`,
        `${dPadded}/${mPadded}/${y}`,
        `${y}-${mPadded}-${dPadded}`,
        `${y}/${mPadded}/${dPadded}`
      ];

      if (matchPatterns.includes(inputClean) || matchPatterns.includes(inputDigits)) {
        return true;
      }
    }
    return false;
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

      // 🔥 BULLETPROOF RE-LOGIN BLOCK CHECK 🔥
      const localData = localStorage.getItem(`cyntax_test_done_${matchedStudent.studentId}`);
      const isAlreadyGiven = 
        matchedStudent.hasGivenTest === true ||
        matchedStudent.hasGivenTest === "yes" ||
        matchedStudent.hasGivenTest === "true" ||
        matchedStudent.certificateDetails?.hasGivenTest === true ||
        !!localData;

      if (isAlreadyGiven) {
        alert(
          `🛑 Access Denied!\nDear ${matchedStudent.name}, aap already apna online test submit kar chuke hain.\nDubara test attempt karna allowed nahi hai!`
        );
        setLoading(false);
        return;
      }

      const isValidPassword = checkDobMatch(matchedStudent.dob, studentPassword);

      if (!isValidPassword) {
        alert(`Galat Password!\nPassword aapki Date of Birth (DOB) hai jo admission form me dali thi.\nExample: DDMMYYYY ya YYYY-MM-DD`);
        setLoading(false);
        return;
      }

      sessionStorage.setItem('activeExamStudent', JSON.stringify(matchedStudent));
      navigate('/online-test');

    } catch (err) {
      console.error("Login verification error:", err);
      alert("Server connection fail! Dobara prayas karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div className="login-card shadow-lg border-0 bg-white overflow-hidden" style={{ maxWidth: '450px', width: '90%', borderRadius: '20px' }}>
        <div className="auth-toggle d-flex bg-light p-2 m-3 rounded-pill">
          <button className={`btn flex-fill rounded-pill ${!isAdmin ? "btn-dark" : ""}`} onClick={() => setIsAdmin(false)}>Student</button>
          <button className={`btn flex-fill rounded-pill ${isAdmin ? "btn-dark" : ""}`} onClick={() => setIsAdmin(true)}>Administrator</button>
        </div>

        <div className="login-body p-4 pt-2">
          {!isAdmin ? (
            <div className="auth-section text-center">
              <i className="fas fa-user-graduate fa-3x text-primary mb-3"></i>
              <h3 className="fw-bold">Student Exam Portal</h3>
              <p className="text-muted small">Apna Roll Number aur Date of Birth (DOB) enter karein.</p>

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
                  placeholder="DOB Password (e.g. 04112004)" 
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
                  style={{ right: '15px', top: '38px', cursor: 'pointer', color: '#666' }} 
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