import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultBank = {
  DCA: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[DCA Q${i + 1}] Which component of a computer system is commonly called its brain?`,
    o: ["Central Processing Unit (CPU)", "Arithmetic Logic Unit", "Cathode Ray Monitor", "Hard Disk Drive"],
    a: 0
  })),
  Steno: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[Steno Q${i + 1}] Pitman Shorthand system is fundamentally based on which principle?`,
    o: ["Phonetic Sounds", "Grammar Syntax", "Alphabetical Spellings", "Punctuation Signs"],
    a: 0
  })),
  "Short Term": Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[Short Term Q${i + 1}] Which markup language is universally used for structuring web pages?`,
    o: ["HTML5", "CSS3", "Photoshop", "Notepad"],
    a: 0
  }))
};

function OnlineTest() {
  const navigate = useNavigate();
  const student = JSON.parse(sessionStorage.getItem('activeExamStudent') || '{}');

  const [countdown, setCountdown] = useState(3);
  const [isTestReady, setIsTestReady] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Strict Submission Lifecycle
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(5);

  // Warnings Tracker: 3 -> 2 -> 1 -> Auto Submit
  const [warningsLeft, setWarningsLeft] = useState(3);
  const warningsLeftRef = useRef(3);
  warningsLeftRef.current = warningsLeft;

  const [showPaletteMobile, setShowPaletteMobile] = useState(false);

  const BASE_URL = "https://cyntaxitinstitute.onrender.com";
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;
  const isSubmittedRef = useRef(false);

  // 1. Auth & Question Bank Loading
  useEffect(() => {
    if (!student._id) {
      navigate('/Login');
      return;
    }

    const savedCustom = localStorage.getItem(`cyntax_questions_${student.course}`);
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (parsed && parsed.length > 0) {
          setQuestions(parsed);
          return;
        }
      } catch (e) {}
    }

    const cKey = (student.course || "").toUpperCase();
    if (cKey.includes("STENO")) {
      setQuestions(defaultBank.Steno);
    } else if (cKey.includes("DCA") || cKey.includes("ADCA")) {
      setQuestions(defaultBank.DCA);
    } else {
      setQuestions(defaultBank["Short Term"]);
    }
  }, [student, navigate]);

  // 2. 3-Second Blue Splash Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTestReady(true);
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    }
  }, [countdown]);

  // 3. COMPLETE FREEZE & SUBMIT FUNCTION
  const executeFinalSubmission = useCallback(async () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true); // Frontend test engine turant freeze ho jayega

    const totalQ = questions.length || 50;
    let attempted = 0;
    let score = 0;

    questions.forEach((q) => {
      const selected = userAnswersRef.current[q.id];
      if (selected !== undefined) {
        attempted += 1;
        if (selected === q.a) score += 1;
      }
    });

    let grade = "A";
    const percentage = (score / totalQ) * 100;
    if (percentage >= 85) grade = "A++";
    else if (percentage >= 70) grade = "A+";
    else if (percentage >= 50) grade = "A";
    else if (percentage >= 40) grade = "B";
    else grade = "C";

    const currentDate = new Date().toISOString().split('T')[0];

    // Status 'Done' karne ke liye payload
    const updatedPayload = {
      ...student,
      hasGivenTest: true,
      testScore: score,
      testDate: currentDate,
      testGrade: grade,
      certificateDetails: {
        ...(student.certificateDetails || {}),
        studentName: student.name,
        fatherName: student.fatherName,
        regNo: student.studentId,
        courseName: student.course,
        duration: student.courseDuration || "6 Months",
        grade: grade,
        issueDate: currentDate
      }
    };

    // Database update
    try {
      await fetch(`${BASE_URL}/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
    } catch (err) {
      console.error("Submission API Error:", err);
    }

    // Set summary screen details
    setSummary({
      name: student.name,
      total: totalQ,
      attempted: attempted
    });

    sessionStorage.removeItem('activeExamStudent');
  }, [BASE_URL, questions, student]);

  // 4. 5-Second Live Auto Redirect to Home Page
  useEffect(() => {
    if (isSubmitted && summary) {
      if (redirectTimer > 0) {
        const rTimer = setTimeout(() => {
          setRedirectTimer(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(rTimer);
      } else {
        navigate('/');
      }
    }
  }, [isSubmitted, summary, redirectTimer, navigate]);

  // 5. Anti-Cheat & Screen Freeze Security
  useEffect(() => {
    if (!isTestReady || isSubmitted) return;

    window.history.pushState(null, null, window.location.href);
    const trapBack = () => {
      window.history.pushState(null, null, window.location.href);
    };

    const blockAllKeys = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const blockContextMenu = (e) => e.preventDefault();

    const blockTouchMove = (e) => {
      if (e.touches.length > 1 || e.pageY < 25) {
        e.preventDefault();
      }
    };

    const handleVisibility = () => {
      if (document.hidden && !isSubmittedRef.current) {
        const left = warningsLeftRef.current;
        if (left > 1) {
          const updated = left - 1;
          setWarningsLeft(updated);
          warningsLeftRef.current = updated;
          alert(`⚠️ EXAMINATION ALERT!\nScreen switch karna sakht mana hai!\nAapke paas sirf ${updated} warning baaki hai.`);
        } else {
          setWarningsLeft(0);
          warningsLeftRef.current = 0;
          alert("⚠️ LIMIT EXCEEDED!\nBaar-baar tab switch karne ke karan test auto-submit kiya ja raha hai!");
          executeFinalSubmission();
        }
      }
    };

    window.addEventListener('popstate', trapBack);
    window.addEventListener('keydown', blockAllKeys, true);
    window.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('touchmove', blockTouchMove, { passive: false });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('popstate', trapBack);
      window.removeEventListener('keydown', blockAllKeys, true);
      window.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('touchmove', blockTouchMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isTestReady, isSubmitted, executeFinalSubmission]);

  // 6. 30-Minute Reverse Timer
  useEffect(() => {
    if (!isTestReady || isSubmitted) return;
    if (timeLeft <= 0) {
      executeFinalSubmission();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isTestReady, isSubmitted, timeLeft, executeFinalSubmission]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------------------------------------------
  // SCREEN 1: 3-SECOND BLUE COUNTDOWN SPLASH
  // -------------------------------------------------------------
  if (!isTestReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: '#0000FF',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', color: '#ffffff', zIndex: 99999999,
        padding: '20px', textAlign: 'center', fontFamily: "'Poppins', sans-serif"
      }}>
        <h2 style={{ fontWeight: '800', letterSpacing: '1px', marginBottom: '15px' }}>CYNTAX ONLINE EXAM PORTAL</h2>
        <p style={{ color: '#e0e7ff', fontSize: '16px' }}>Strict Assessment Mode Initializing... Screen Locked</p>
        <div style={{
          width: '140px', height: '140px', borderRadius: '50%',
          border: '5px solid #ffffff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '75px', fontWeight: '900',
          margin: '30px 0', boxShadow: '0 0 30px rgba(255,255,255,0.4)'
        }}>
          {countdown}
        </div>
        <h4 style={{ fontWeight: '700' }}>READY... BEST OF LUCK!</h4>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: TCS PROFESSIONAL THANKS SCREEN (100% FREEZE + 5S AUTO REDIRECT)
  // -------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999999, padding: '20px', userSelect: 'none'
      }}>
        <div style={{
          backgroundColor: '#ffffff', maxWidth: '580px', width: '100%',
          borderRadius: '24px', padding: '40px 30px', textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', borderTop: '8px solid #0000FF'
        }}>
          <div style={{
            width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '38px', margin: '0 auto 20px auto'
          }}>
            <i className="fas fa-check"></i>
          </div>

          <h3 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
            TEST SUBMITTED SUCCESSFULLY
          </h3>

          <div style={{
            backgroundColor: '#f8fafc', borderRadius: '16px', padding: '24px',
            textAlign: 'left', border: '1px solid #e2e8f0', margin: '20px 0'
          }}>
            <h5 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
              Thanks Mr./Ms. <span style={{ color: '#0000FF' }}>{summary?.name || student.name}</span>!
            </h5>
            <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              Aapka exam successfully submit ho chuka hai.
            </p>
            <p style={{ fontSize: '16px', color: '#0f172a', fontWeight: '600', margin: 0 }}>
              Aapne total <span style={{ color: '#0000FF' }}>{summary?.total || questions.length || 50}</span> questions mein se <span style={{ color: '#16a34a' }}>{summary?.attempted ?? 0}</span> question attempt kiye hain.
            </p>
          </div>

          {/* 5-Second Live Redirect Counter */}
          <div style={{
            backgroundColor: '#eff6ff', border: '1px dashed #3b82f6',
            borderRadius: '12px', padding: '12px', marginBottom: '20px',
            color: '#1d4ed8', fontSize: '14px', fontWeight: '600'
          }}>
            <i className="fas fa-spinner fa-spin me-2"></i>
            Auto redirecting to Home Page in <b>{redirectTimer}</b> seconds...
          </div>

          <button 
            onClick={() => navigate('/')}
            style={{
              width: '100%', padding: '14px', borderRadius: '50px',
              backgroundColor: '#0000FF', color: '#ffffff', border: 'none',
              fontWeight: '700', fontSize: '16px', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 255, 0.3)'
            }}
          >
            Finish & Exit Now
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="p-5 text-center"><h3>Loading Assessment Questions...</h3></div>;
  }

  const currentQ = questions[currentIndex];

  // -------------------------------------------------------------
  // SCREEN 3: EXAM INTERFACE (NO BACKGROUND CLICKS DURING SUBMIT)
  // -------------------------------------------------------------
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      backgroundColor: '#f8fafc', zIndex: 9999999, userSelect: 'none',
      WebkitUserSelect: 'none', overscrollBehavior: 'none'
    }}>
      {/* Header Bar */}
      <header style={{
        backgroundColor: '#1e293b', color: 'white',
        padding: '10px 15px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 10
      }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>{student.name}</div>
          <small style={{ color: '#38bdf8' }}>{student.course} ({student.studentId})</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#dc2626', color: 'white', padding: '4px 12px',
            borderRadius: '20px', fontWeight: '800', fontSize: '14px'
          }}>
            <i className="far fa-clock me-1"></i>{formatTimer(timeLeft)}
          </div>

          <span className="badge bg-warning text-dark px-2 py-1 d-none d-md-inline">
            Warnings Left: {warningsLeft}
          </span>

          <button 
            onClick={() => setShowPaletteMobile(!showPaletteMobile)}
            className="btn btn-sm btn-outline-light d-md-none rounded-pill"
          >
            <i className="fas fa-th"></i>
          </button>

          <button 
            onClick={() => {
              if (window.confirm("Bhai kya aap sach mein final paper submit karna chahte hain?")) {
                executeFinalSubmission();
              }
            }}
            style={{
              backgroundColor: '#16a34a', color: 'white', border: 'none',
              padding: '6px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Final Submit
          </button>
        </div>
      </header>

      {/* Main Examination Area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* Left Question Area */}
        <div style={{
          flex: 1, padding: '15px 20px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
              <span style={{ fontWeight: '800', color: '#0000FF' }}>Question {currentIndex + 1} of {questions.length}</span>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold' }}>
                Warnings Remaining: {warningsLeft}
              </span>
            </div>

            <h5 style={{ color: '#1e293b', fontWeight: '600', lineHeight: 1.4, marginBottom: '20px' }}>
              {currentQ.q}
            </h5>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.o.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isSubmitted) {
                        setUserAnswers({ ...userAnswers, [currentQ.id]: idx });
                      }
                    }}
                    style={{
                      padding: '12px 15px', borderRadius: '10px',
                      border: isSelected ? '2px solid #0000FF' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: isSelected ? '5px solid #0000FF' : '2px solid #94a3b8',
                      backgroundColor: 'white'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#334155' }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '20px' }}>
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
              >
                Save & Next
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm("Bhai saare questions attempt ho gaye? Final paper submit kar dein?")) {
                    executeFinalSubmission();
                  }
                }}
                className="btn btn-success btn-sm px-4 rounded-pill fw-bold"
              >
                Final Submit
              </button>
            )}
          </div>
        </div>

        {/* Right Question Palette */}
        <div style={{
          width: '280px', backgroundColor: '#ffffff', borderLeft: '2px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', height: '100%',
          position: window.innerWidth < 768 ? 'absolute' : 'relative',
          right: 0, top: 0, bottom: 0, zIndex: 20,
          transform: window.innerWidth < 768 && !showPaletteMobile ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ padding: '12px 15px', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '800', fontSize: '13px' }}>QUESTION PALETTE</span>
            {window.innerWidth < 768 && (
              <button className="btn-close btn-sm" onClick={() => setShowPaletteMobile(false)}></button>
            )}
          </div>

          <div style={{
            flex: 1, padding: '12px', overflowY: 'auto',
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px'
          }}>
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (window.innerWidth < 768) setShowPaletteMobile(false);
                  }}
                  style={{
                    height: '38px', border: isCurrent ? '2px solid #0000FF' : 'none',
                    borderRadius: '6px',
                    backgroundColor: isAnswered ? '#16a34a' : '#e2e8f0',
                    color: isAnswered ? '#ffffff' : '#334155',
                    fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default OnlineTest;