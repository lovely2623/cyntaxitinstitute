import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Demo 50 questions default seed (agar custom questions backend se nahi milte)
const defaultBank = {
  DCA: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[DCA Q${i + 1}] Which part of the computer is responsible for processing calculations?`,
    o: ["Arithmetic Logic Unit (ALU)", "Monitor Display", "Keyboard Controller", "Secondary Storage"],
    a: 0
  })),
  Steno: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[Steno Q${i + 1}] Pitman Shorthand system is primarily based on which principle?`,
    o: ["Phonetic Sounds", "Alphabetical Spellings", "Grammar Syntax", "Punctuation Rules"],
    a: 0
  })),
  "Short Term": Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    q: `[Short Term Q${i + 1}] Which technology is standard for structuring web pages?`,
    o: ["HTML5", "Photoshop", "Notepad", "MySQL"],
    a: 0
  }))
};

function OnlineTest() {
  const navigate = useNavigate();
  const student = JSON.parse(sessionStorage.getItem('activeExamStudent') || '{}');

  // Blue Screen Countdown States (3... 2... 1...)
  const [countdown, setCountdown] = useState(3);
  const [isTestReady, setIsTestReady] = useState(false);

  // Exam States
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 Minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [resultData, setResultData] = useState(null);

  const BASE_URL = "https://cyntaxitinstitute.onrender.com";
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;

  // 1. Check Auth & Load Questions
  useEffect(() => {
    if (!student._id) {
      navigate('/Login');
      return;
    }

    // Try to load custom questions from localStorage first, else default
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
      // Request Fullscreen immediately
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    }
  }, [countdown]);

  // 3. Final Submit Handler
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    let attemptedCount = 0;
    let score = 0;

    questions.forEach((q) => {
      const ans = userAnswersRef.current[q.id];
      if (ans !== undefined) {
        attemptedCount += 1;
        if (ans === q.a) {
          score += 1;
        }
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
      console.error(e);
    }

    setResultData({
      name: student.name,
      attempted: attemptedCount,
      total: questions.length || 50,
      score: score,
      grade: grade
    });
    sessionStorage.removeItem('activeExamStudent');
  }, [BASE_URL, isSubmitted, questions, student]);

  // 4. Strict Keyboard Lock, Escape Blocker & Anti-Tab Switch
  useEffect(() => {
    if (!isTestReady || isSubmitted) return;

    // Completely prevent mouse right click
    const blockContext = (e) => e.preventDefault();

    // Absolute Keyboard Lock: Mouse clicks only
    const blockKeyboard = (e) => {
      // Block Escape, Backspace, Tab, Function keys, and Ctrl/Alt combos
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Tab Switch Detect
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setWarnings(prev => {
          const nextW = prev + 1;
          alert(`⚠️ ALERT ${nextW}/3: Tab switch karna sakht mana hai! 3 warnings par test auto-submit ho jayega.`);
          if (nextW >= 3) {
            handleFinalSubmit();
          }
          return nextW;
        });
      }
    };

    // Block back navigation
    window.history.pushState(null, null, window.location.href);
    const blockBackNav = () => {
      window.history.pushState(null, null, window.location.href);
    };

    const blockBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('contextmenu', blockContext);
    window.addEventListener('keydown', blockKeyboard, true);
    window.addEventListener('popstate', blockBackNav);
    window.addEventListener('beforeunload', blockBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', blockContext);
      window.removeEventListener('keydown', blockKeyboard, true);
      window.removeEventListener('popstate', blockBackNav);
      window.removeEventListener('beforeunload', blockBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTestReady, isSubmitted, handleFinalSubmit]);

  // 5. Reverse Timer 30 Mins
  useEffect(() => {
    if (!isTestReady || isSubmitted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isTestReady, isSubmitted, timeLeft, handleFinalSubmit]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------------------------------------------
  // SCREEN 1: 3-SECOND BLUE COUNTDOWN
  // -------------------------------------------------------------
  if (!isTestReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#0000FF',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#ffffff', zIndex: 99999999,
        fontFamily: "'Poppins', sans-serif"
      }}>
        <h1 style={{ fontSize: '45px', fontWeight: '800', letterSpacing: '2px', marginBottom: '20px' }}>
          CYNTAX EXAMINATION ENGINE
        </h1>
        <p style={{ fontSize: '20px', color: '#cbd5e1' }}>Strict Mode Initializing... Lock all windows</p>
        <div style={{
          width: '180px', height: '180px', borderRadius: '50%',
          border: '6px solid white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '90px', fontWeight: '900',
          margin: '30px 0', boxShadow: '0 0 40px rgba(255,255,255,0.4)'
        }}>
          {countdown}
        </div>
        <h3 style={{ fontWeight: '700', letterSpacing: '1px' }}>READY... GET SET!</h3>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: TCS PROFESSIONAL SUBMISSION MESSAGE SCREEN
  // -------------------------------------------------------------
  if (resultData) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#0b132b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999999, padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff', maxWidth: '650px', width: '100%',
          borderRadius: '25px', padding: '40px', textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <i className="fas fa-award text-primary" style={{ fontSize: '70px', marginBottom: '20px' }}></i>
          <h2 style={{ fontWeight: '800', color: '#1e293b' }}>EXAM SUBMITTED SUCCESSFULLY</h2>
          
          <div style={{
            background: '#f1f5f9', borderRadius: '15px', padding: '25px',
            margin: '25px 0', borderLeft: '6px solid #0000FF', textAlign: 'left'
          }}>
            <h5 style={{ fontWeight: '700', color: '#0f172a' }}>
              Thanks Mr./Ms. <span style={{ color: '#0000FF' }}>{resultData.name}</span>,
            </h5>
            <p style={{ fontSize: '16px', color: '#475569', margin: '10px 0 0 0' }}>
              Aapka exam successfully submit ho chuka hai.
            </p>
            <p style={{ fontSize: '16px', color: '#475569', margin: '5px 0 0 0' }}>
              Aapne total <b>{resultData.total}</b> questions mein se <b>{resultData.attempted}</b> question attempt kiye hain.
            </p>
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
    return <div className="p-5 text-center"><h3>Loading Assessment...</h3></div>;
  }

  const currentQ = questions[currentIndex];

  // -------------------------------------------------------------
  // SCREEN 3: TCS iON STYLE EXAM UI WITH SIDE QUESTION PALETTE
  // -------------------------------------------------------------
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#f8fafc', zIndex: 9999999,
      userSelect: 'none', WebkitUserSelect: 'none'
    }}>
      {/* Header Bar */}
      <header style={{
        height: '65px', backgroundColor: '#1e293b', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>{student.name}</span>
          <span style={{ marginLeft: '12px', background: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>
            Roll: {student.studentId}
          </span>
          <span style={{ marginLeft: '10px', color: '#38bdf8', fontSize: '14px', fontWeight: '600' }}>
            ({student.course})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            background: '#dc2626', color: 'white', padding: '6px 18px',
            borderRadius: '50px', fontWeight: '800', fontSize: '17px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className="far fa-clock"></i>
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button 
            onClick={() => {
              if (window.confirm("Sure ho final test submit karna hai?")) {
                handleFinalSubmit();
              }
            }}
            style={{
              backgroundColor: '#16a34a', color: 'white', border: 'none',
              padding: '8px 24px', borderRadius: '50px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
            }}
          >
            Final Submit
          </button>
        </div>
      </header>

      {/* Main Container: Question Area (Left) + TCS Palette (Right) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left: Active Question Display */}
        <div style={{ flex: 1, padding: '30px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '25px' }}>
              <h5 style={{ fontWeight: '800', color: '#0000FF', margin: 0 }}>
                Question No. {currentIndex + 1}
              </h5>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Single Choice MCQ</span>
            </div>

            <h4 style={{ color: '#1e293b', fontWeight: '600', lineHeight: 1.5, marginBottom: '30px' }}>
              {currentQ.q}
            </h4>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {currentQ.o.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: idx })}
                    style={{
                      padding: '16px 20px', borderRadius: '12px',
                      border: isSelected ? '2px solid #0000FF' : '2px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                      transition: '0.2s', fontWeight: isSelected ? '700' : '500'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: isSelected ? '6px solid #0000FF' : '2px solid #94a3b8',
                      backgroundColor: 'white'
                    }}></div>
                    <span style={{ color: '#334155' }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '30px' }}>
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              style={{
                padding: '10px 25px', borderRadius: '10px', border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff', fontWeight: '700', cursor: 'pointer'
              }}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                style={{
                  padding: '10px 35px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#0000FF', color: 'white', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Save & Next
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm("Aakhri question ho gaya! Paper submit kar dein?")) {
                    handleFinalSubmit();
                  }
                }}
                style={{
                  padding: '10px 35px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#16a34a', color: 'white', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Final Submit
              </button>
            )}
          </div>
        </div>

        {/* Right: TCS Style 50 Question Palette */}
        <div style={{
          width: '320px', backgroundColor: '#ffffff', borderLeft: '2px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', height: '100%'
        }}>
          <div style={{ padding: '15px 20px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <h6 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>QUESTION PALETTE</h6>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '11px', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '3px' }}></span> Answered
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', background: '#e2e8f0', borderRadius: '3px' }}></span> Unanswered
              </span>
            </div>
          </div>

          <div style={{
            flex: 1, padding: '15px', overflowY: 'auto',
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px'
          }}>
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: '42px', border: isCurrent ? '2px solid #0000FF' : 'none',
                    borderRadius: '8px',
                    backgroundColor: isAnswered ? '#16a34a' : '#e2e8f0',
                    color: isAnswered ? '#ffffff' : '#334155',
                    fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                    boxShadow: isCurrent ? '0 0 8px rgba(0,0,255,0.4)' : 'none'
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