import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

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

    // Official Credentials
    if (email === 'admin@test.com' && password === '123456') {
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('lastLogin', new Date().getTime()); // Track login time
      navigate('/AdminLayout/Dashboard');
    } else {
      alert('Galat user ya password hai!');
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
              <h3 className="fw-bold">Student Portal</h3>
              <p className="text-muted small">Apna Roll Number daal kar test shuru karein.</p>
              <input type="text" className="form-control rounded-pill mb-3 py-2 text-center" placeholder="Roll Number (e.g. 101)" />
              <button className="btn btn-primary w-100 rounded-pill py-2 shadow-sm" onClick={() => navigate('/online-test')}>Start Test 🚀</button>
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

              <button className="btn btn-dark w-100 rounded-pill py-2 mb-2 shadow" onClick={handleAdminLogin}>
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