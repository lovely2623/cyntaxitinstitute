import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentTestPortal() {
  const [rollNo, setRollNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

  // Client-side timezone-safe DOB comparison fallback
  const checkDobMatchLocal = (dbDobRaw, userPassRaw) => {
    if (!dbDobRaw || !userPassRaw) return false;

    const inputClean = String(userPassRaw).trim();
    const inputDigits = inputClean.replace(/[^0-9]/g, '');

    let d = '', m = '', y = '';
    const rawStr = String(dbDobRaw).trim();

    if (rawStr.includes('-') || rawStr.includes('/')) {
      const parts = rawStr.split('T')[0].split(/[-/]/);
      if (parts[0].length === 4) {
        y = parts[0]; m = parts[1]; d = parts[2];
      } else {
        d = parts[0]; m = parts[1]; y = parts[2];
      }
    } else {
      const dateObj = new Date(dbDobRaw);
      if (!isNaN(dateObj.getTime())) {
        y = String(dateObj.getUTCFullYear());
        m = String(dateObj.getUTCMonth() + 1);
        d = String(dateObj.getUTCDate());
      }
    }

    if (d && m && y) {
      const dPad = d.padStart(2, '0');
      const mPad = m.padStart(2, '0');

      const validPatterns = [
        `${dPad}${mPad}${y}`,
        `${y}${mPad}${dPad}`,
        `${dPad}-${mPad}-${y}`,
        `${dPad}/${mPad}/${y}`,
        `${y}-${mPad}-${dPad}`,
        `${y}/${mPad}/${dPad}`
      ];

      return validPatterns.includes(inputClean) || validPatterns.includes(inputDigits);
    }
    return false;
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    const cleanRoll = rollNo.trim().toUpperCase();
    const cleanPass = studentPassword.trim();

    if (!cleanRoll || !cleanPass) {
      alert("Roll Number aur Password (DOB) dono enter karein!");
      return;
    }

    setLoading(true);

    // Step 1: Server Authentication Route
    try {
      const loginRes = await fetch(`${BASE_URL}/api/students/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: cleanRoll,
          dob: cleanPass
        })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.success && loginData.student) {
        localStorage.removeItem(`cyntax_test_done_${loginData.student.studentId}`);
        sessionStorage.removeItem('activeExamStudent');
        sessionStorage.setItem('activeExamStudent', JSON.stringify(loginData.student));
        navigate('/online-test');
        return;
      } else if (loginRes.status === 401 || loginRes.status === 403 || loginRes.status === 404) {
        alert(loginData.message || "Invalid Credentials! Access Denied.");
        setLoading(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Direct login route unavailable, running local verification:", apiErr);
    }

    // Step 2: Fallback Client Verification
    try {
      const response = await fetch(`${BASE_URL}/api/students`, { cache: 'no-cache' });
      const students = await response.json();

      const matchedStudent = students.find(
        (s) => (s.studentId && s.studentId.trim().toUpperCase() === cleanRoll) ||
               (s.rollNo && s.rollNo.trim().toUpperCase() === cleanRoll)
      );

      if (!matchedStudent) {
        alert("Ye Roll Number database mein nahi mila! Sahi Roll No daalein.");
        setLoading(false);
        return;
      }

      const localData = localStorage.getItem(`cyntax_test_done_${matchedStudent.studentId}`);
      const isAlreadyGiven = 
        matchedStudent.hasGivenTest === true ||
        matchedStudent.hasGivenTest === "true" ||
        matchedStudent.details?.hasGivenTest === true ||
        !!localData;

      if (isAlreadyGiven) {
        alert(`Access Denied!\nDear ${matchedStudent.name}, aap already apna online test submit kar chuke hain.`);
        setLoading(false);
        return;
      }

      const targetDob = matchedStudent.dob || matchedStudent.details?.dob;
      const isValidPassword = checkDobMatchLocal(targetDob, cleanPass);

      if (!isValidPassword) {
        alert(`Galat Password!\nPassword aapki Date of Birth hai (Example: DDMMYYYY jaise 15082002 ya YYYY-MM-DD).`);
        setLoading(false);
        return;
      }

      localStorage.removeItem(`cyntax_test_done_${matchedStudent.studentId}`);
      sessionStorage.removeItem('activeExamStudent');
      sessionStorage.setItem('activeExamStudent', JSON.stringify(matchedStudent));
      navigate('/online-test');

    } catch (err) {
      console.error("Student login error:", err);
      alert("Server connection error! Dobara prayas karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '130px',
      paddingBottom: '50px',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <style>{`
        .portal-input-field {
          width: 100% !important;
          height: 48px !important;
          background-color: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 12px !important;
          padding: 0 15px 0 45px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #0f172a !important;
          outline: none !important;
          box-sizing: border-box !important;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .portal-input-field:focus {
          border-color: #0000FF !important;
          box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.15) !important;
        }
        .portal-input-field::placeholder {
          color: #94a3b8 !important;
          font-weight: 400 !important;
          opacity: 1 !important;
        }
        .portal-input-wrapper {
          position: relative !important;
          width: 100% !important;
        }
        .portal-input-icon {
          position: absolute !important;
          left: 15px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          color: #0000FF !important;
          font-size: 16px !important;
          pointer-events: none !important;
          z-index: 2 !important;
        }
        .portal-pass-toggle {
          position: absolute !important;
          right: 15px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          color: #64748b !important;
          cursor: pointer !important;
          font-size: 16px !important;
          z-index: 3 !important;
          background: none !important;
          border: none !important;
          padding: 0 !important;
        }
      `}</style>

      <div style={{
        maxWidth: '460px',
        width: '92%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: '#0000FF',
          padding: '28px 20px',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            fontSize: '28px'
          }}>
            <i className="fas fa-laptop-code"></i>
          </div>
          <h4 style={{ fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '0.3px' }}>
            Cyntax Online Exam Portal
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#e0e7ff' }}>
            Candidate Assessment & Verification Gateway
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '30px 24px' }}>
          <form onSubmit={handleStudentLogin}>
            {/* Roll Number Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '8px'
              }}>
                Registration / Roll Number
              </label>
              <div className="portal-input-wrapper">
                <i className="fas fa-id-card portal-input-icon"></i>
                <input 
                  type="text" 
                  className="portal-input-field"
                  placeholder="e.g. CYN-101 ya Roll No" 
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  required
                />
              </div>
            </div>

            {/* DOB Password Field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '8px'
              }}>
                DOB Password (DDMMYYYY ya Date)
              </label>
              <div className="portal-input-wrapper">
                <i className="fas fa-key portal-input-icon"></i>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="portal-input-field"
                  placeholder="e.g. 15082002 ya 2002-08-15" 
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  autoCorrect="off"
                  required
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  className="portal-pass-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <small style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '11px',
                color: '#64748b'
              }}>
                * Format: <b>DDMMYYYY</b> (e.g. 15082002) ya date format (<b>2002-08-15</b>).
              </small>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '50px',
                backgroundColor: '#0000FF',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i> Verifying Candidate...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i> Start Online Examination
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div style={{
            marginTop: '25px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <small style={{ fontSize: '12px', color: '#64748b' }}>
              Exam helpline: <b style={{ color: '#0f172a' }}>8988199226</b>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentTestPortal;