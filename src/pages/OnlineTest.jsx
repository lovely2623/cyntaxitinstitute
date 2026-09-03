import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultBank = {
  DCA: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[DCA Q${i + 1}] Which part of the computer system is primarily known as the brain?`,
    o: ["Central Processing Unit (CPU)", "Arithmetic Unit", "Monitor", "Hard Disk Drive"],
    a: 0
  })),
  Steno: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[Steno Q${i + 1}] Pitman Shorthand system is primarily based on which principle?`,
    o: ["Phonetic Sounds", "Grammar Rules", "Alphabetical Spellings", "Punctuation Signs"],
    a: 0
  })),
  "Short Term": Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[Short Term Q${i + 1}] What is the primary language used to structure web pages?`,
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Warnings left countdown: 3 -> 2 -> 1 -> Submit
  const [warningsLeft, setWarningsLeft] = useState(3);
  const warningsLeftRef = useRef(3);
  warningsLeftRef.current = warningsLeft;

  const [resultData, setResultData] = useState(null);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);

  const BASE_URL = "https://cyntaxitinstitute.onrender.com";
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;

  // Load Questions
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

  // 3-Second Blue Splash Timer
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

  // Submit Handler (Works for both Manual & Auto-Submit)
  const handleFinalSubmit = useCallback(async (isAuto = false, reason = "") => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    let attemptedCount = 0;
    let score = 0;

    questions.forEach((q) => {
      const ans = userAnswersRef.current[q.id];
      if (ans !== undefined) {
        attemptedCount += 1;
        if (ans === q.a) score += 1;
      }
    });

    let grade = "A";
    const percentage = (score / (questions.length || 50)) * 100;
    if (percentage >= 85) grade = "A++";
    else if (percentage >= 70) grade = "A+";
    else if (percentage >= 50) grade = "A";
    else if (percentage >= 40) grade = "B";
    else grade = "C";

    const currentDate = new Date().toISOString().split('T')[0];

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

    try {
      await fetch(`${BASE_URL}/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
    } catch (e) {
      console.error("Update DB error:", e);
    }

    setResultData({
      name: student.name,
      attempted: attemptedCount,
      total: questions.length || 50,
      score: score,
      grade: grade,
      isAuto: isAuto,
      reason: reason
    });
    sessionStorage.removeItem('activeExamStudent');
  }, [BASE_URL, isSubmitted, questions, student]);

  // Tab Switch & Window Exit Detection (3 -> 2 -> 1 -> Submit)
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
      if (document.hidden && !isSubmitted) {
        const currentLeft = warningsLeftRef.current;
        if (currentLeft > 1) {
          const nextLeft = currentLeft - 1;
          setWarningsLeft(nextLeft);
          warningsLeftRef.current = nextLeft;
          alert(`⚠️ WARNING! Screen chhodna mana hai! Aapke paas sirf ${nextLeft} warning baaki hai. 0 hote hi test auto-submit ho jayega!`);
        } else {
          setWarningsLeft(0);
          warningsLeftRef.current = 0;
          alert("⚠️ LIMIT EXCEEDED! Aapne baar-baar screen switch kiya. Test auto-submit kiya ja raha hai!");
          handleFinalSubmit(true, "Tab Switch Violation");
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
  }, [isTestReady, isSubmitted, handleFinalSubmit]);

  // 30 Minutes Timer
  useEffect(() => {
    if (!isTestReady || isSubmitted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit(true, "Time Up");
      return;
    }
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [isTestReady, isSubmitted, timeLeft, handleFinalSubmit]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Screen 1: 3-Second Blue Countdown Splash
  if (!isTestReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: '#0000FF',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', color: '#fff', zIndex: 99999999,
        padding: '20px', textAlign: 'center'
      }}>
        <h2 style={{ fontWeight: '800', marginBottom: '15px' }}>CYNTAX EXAM PORTAL</h2>
        <p style={{ color: '#cbd5e1', fontSize: '15px' }}>Exam Mode Initializing... Please wait</p>
        <div style={{
          width: '130px', height: '130px', borderRadius: '50%',
          border: '5px solid white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '65px', fontWeight: '900',
          margin: '25px 0'
        }}>
          {countdown}
        </div>
        <h4>READY... GET SET!</h4>
      </div>
    );
  }

  // Screen 2: Personalized Submission Message
  if (resultData) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: '#0b132b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999999, padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#fff', maxWidth: '560px', width: '100%',
          borderRadius: '25px', padding: '35px 25px', textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <i className="fas fa-check-circle text-success" style={{ fontSize: '65px', marginBottom: '15px' }}></i>
          <h3 style={{ fontWeight: '800', color: '#1e293b' }}>
            {resultData.isAuto ? "EXAM AUTO-SUBMITTED" : "PAPER SUBMITTED SUCCESSFULLY"}
          </h3>
          
          <div style={{
            background: '#f8fafc', borderRadius: '15px', padding: '22px',
            margin: '20px 0', borderLeft: '6px solid #0000FF', textAlign: 'left'
          }}>
            <h5 style={{ fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
              Thanks Mr./Ms. <span style={{ color: '#0000FF' }}>{resultData.name}</span>!
            </h5>
            <p style={{ fontSize: '15px', color: '#334155', margin: '0 0 8px 0', lineHeight: '1.5' }}>
              Aapka exam successfully submit ho chuka hai.
            </p>
            <p style={{ fontSize: '15px', color: '#334155', margin: '0 0 8px 0' }}>
              Aapne total <b>{resultData.total}</b> questions mein se <b>{resultData.attempted}</b> questions attempt kiye hain.
            </p>
            {resultData.isAuto && (
              <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, fontWeight: 'bold' }}>
                Reason: {resultData.reason}
              </p>
            )}
          </div>

          <button 
            className="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow"
            onClick={() => navigate('/')}
          >
            Finish & Return to Portal
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="p-5 text-center"><h3>Loading Assessment Questions...</h3></div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      backgroundColor: '#f8fafc', zIndex: 9999999, userSelect: 'none',
      WebkitUserSelect: 'none', overscrollBehavior: 'none'
    }}>
      {/* Top Bar */}
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
              if (window.confirm("Sure ho final test submit karna hai?")) handleFinalSubmit(false);
            }}
            style={{
              backgroundColor: '#16a34a', color: 'white', border: 'none',
              padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '13px'
            }}
          >
            Final Submit
          </button>
        </div>
      </header>

      {/* Main Area */}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentQ.o.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: idx })}
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

          {/* Nav Buttons */}
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
                  if (window.confirm("Paper submit karein?")) handleFinalSubmit(false);
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
                    fontWeight: '700', fontSize: '12px'
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