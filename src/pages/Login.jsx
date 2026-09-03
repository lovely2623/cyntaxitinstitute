import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
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

  const handleAdminLogin = (e) => {
    e.preventDefault();
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

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f0f2f5', paddingTop: '80px' }}>
      <div className="login-card shadow-lg border-0 bg-white overflow-hidden" style={{ maxWidth: '420px', width: '90%', borderRadius: '20px' }}>
        <div className="login-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div style={{ width: '65px', height: '65px', backgroundColor: '#1e293b', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '26px' }}>
              <i className="fas fa-lock"></i>
            </div>
            <h3 className="fw-bold text-dark">Admin Control Panel</h3>
            <p className="text-muted small">Cyntax Management Access</p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div className="mb-3">
              <label className="small fw-bold text-muted ps-2">Email Address</label>
              <input 
                type="email" 
                className="form-control rounded-pill py-2 ps-3" 
                placeholder="admin@test.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="mb-4 position-relative">
              <label className="small fw-bold text-muted ps-2">Security Password</label>
              <input 
                type={showPass ? "text" : "password"} 
                className="form-control rounded-pill py-2 ps-3" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <i 
                className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                style={{ right: '15px', top: '38px', cursor: 'pointer', color: '#666' }} 
                onClick={() => setShowPass(!showPass)} 
              ></i>
            </div>

            <button type="submit" className="btn btn-dark w-100 rounded-pill py-2 shadow fw-bold">
              Verify & Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;