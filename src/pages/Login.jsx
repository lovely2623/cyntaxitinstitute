import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // SECURITY: Agar pehle se login hai toh wapas dashboard bhejo
  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (auth === 'true') {
      navigate('/AdminLayout/Dashboard');
    }
  }, [navigate]);

  const handleAdminLogin = () => {
    if (email === 'admin@test.com' && password === '123456') {
      alert('Login Successful! Welcome Mohit Sir.');
      localStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/AdminLayout/Dashboard');
      window.location.reload(); 
    } else {
      alert('Galat Email ya Password hai bhai!');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card shadow-lg">
        <div className="auth-toggle">
          <button className={!isAdmin ? "active" : ""} onClick={() => setIsAdmin(false)}>Student Test</button>
          <button className={isAdmin ? "active" : ""} onClick={() => setIsAdmin(true)}>Admin Login</button>
        </div>

        <div className="login-body p-4">
          {!isAdmin ? (
            <div className="auth-section fade-in">
              <h2 className="text-dark fw-bold">Student Portal 🎓</h2>
              <p className="text-muted small">Enter your roll number to begin your exam.</p>
              <div className="input-field mt-3">
                <input type="text" className="form-control" placeholder="Roll Number (e.g. 101)" style={{color: '#000', borderRadius: '8px'}} />
              </div>
              <button className="main-btn mt-4 w-100" onClick={() => navigate('/online-test')}>Start Online Test 🚀</button>
            </div>
          ) : (
            <div className="auth-section fade-in">
              <h2 className="text-dark fw-bold">Admin Access 🔐</h2>
              <p className="text-muted small">Only authorized personnel can access this area.</p>
              <div className="input-field mt-3">
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="Admin Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={{color: '#000', borderRadius: '8px'}}
                />
              </div>
              <div className="input-field mt-3">
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{color: '#000', borderRadius: '8px'}}
                />
              </div>
              <button className="main-btn mt-4 w-100" onClick={handleAdminLogin}>
                Access Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;