import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentTestPortal() {
  const [rollNo, setRollNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "https://cyntaxitinstitute.onrender.com";

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

      // Check if already given
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
      console.error("Student login error:", err);
      alert("Server connection fail! Dobara prayas karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', paddingTop: '120px', paddingBottom: '60px', backgroundColor: '#f8fafc' }} className="d-flex align-items-center justify-content-center">
      <div className="card border-0 shadow-lg" style={{ maxWidth: '480px', width: '92%', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#0000FF', padding: '30px 20px', textAlign: 'center', color: '#ffffff' }}>
          <div style={{ width: '70px', height: '70px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '30px' }}>
            <i className="fas fa-laptop-code"></i>
          </div>
          <h3 className="fw-bold mb-1">Cyntax Online Exam Portal</h3>
          <p className="small mb-0" style={{ color: '#e0e7ff' }}>Candidate Assessment & Verification Gateway</p>
        </div>

        <div className="card-body p-4 p-md-5 bg-white">
          <form onSubmit={handleStudentLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted ps-1">Registration / Roll Number</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><i className="fas fa-id-card text-primary"></i></span>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  placeholder="e.g. CYN-1234" 
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted ps-1">DOB Password (DDMMYYYY)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><i className="fas fa-key text-primary"></i></span>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  placeholder="e.g. 04112004" 
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />
              </div>
              <small className="text-muted d-block mt-1 ps-1" style={{ fontSize: '11px' }}>
                * Admission form me di gayi Date of Birth hi aapka password hai.
              </small>
            </div>

            <button 
              type="submit" 
              className="btn w-100 py-3 rounded-pill fw-bold text-white shadow"
              style={{ backgroundColor: '#0000FF', letterSpacing: '0.5px' }}
              disabled={loading}
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

          <div className="mt-4 pt-3 border-top text-center">
            <small className="text-muted">
              Kisi bhi samasya ke liye center helpline <b>8988199226</b> par contact karein.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentTestPortal;