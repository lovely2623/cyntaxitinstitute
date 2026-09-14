import React, { useState, useEffect, useCallback } from 'react';

function ManageQuestions() {
  const [course, setCourse] = useState('DCA');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    q: '',
    o1: '',
    o2: '',
    o3: '',
    o4: '',
    a: 0
  });

  const BASE_URL = "https://cyntaxitinstitute.onrender.com";
  const storageKey = `cyntax_questions_${course}`;

  // 1. Dual Loader: Pehle local storage load kare fir remote API se exact match laye
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        }
      } catch (e) {
        console.error("Local parse error:", e);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/api/questions?course=${encodeURIComponent(course)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : (raw.questions || raw.data || []);
        const filtered = list.filter(q => !q.course || q.course.toUpperCase() === course.toUpperCase());
        setQuestions(filtered);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
      }
    } catch (err) {
      console.warn("Server questions fetch failed, running on offline storage:", err);
    } finally {
      setIsLoading(false);
    }
  }, [course, storageKey, BASE_URL]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // 2. Add Question Handler
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!form.q.trim() || !form.o1.trim() || !form.o2.trim() || !form.o3.trim() || !form.o4.trim()) {
      alert("Saari fields bharein!");
      return;
    }

    const tempId = Date.now();
    const newQ = {
      id: tempId,
      q: form.q.trim(),
      o: [form.o1.trim(), form.o2.trim(), form.o3.trim(), form.o4.trim()],
      a: parseInt(form.a, 10),
      course: course
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setForm({ q: '', o1: '', o2: '', o3: '', o4: '', a: 0 });

    try {
      const res = await fetch(`${BASE_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });

      if (res.ok) {
        const savedData = await res.json();
        if (savedData && (savedData._id || savedData.id)) {
          const syncedList = updated.map(item => item.id === tempId ? { ...item, ...savedData } : item);
          setQuestions(syncedList);
          localStorage.setItem(storageKey, JSON.stringify(syncedList));
        }
        alert(`Question successfully database mein save ho gaya! Total: ${updated.length}`);
      } else {
        alert("Server par save nahi ho paya, local device par save hai.");
      }
    } catch (err) {
      console.error("Remote save error:", err);
      alert("Question locally save ho gaya hai.");
    }
  };

  // 3. Delete Handler
  const handleDelete = async (questionObj) => {
    const targetId = questionObj._id || questionObj.id;
    if (!window.confirm("Bhai ye question delete karna hai?")) return;

    const updated = questions.filter(q => (q._id ? q._id !== targetId : q.id !== targetId));
    setQuestions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    try {
      const res = await fetch(`${BASE_URL}/api/questions/${targetId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        console.warn("Backend par delete fail hua.");
      }
    } catch (err) {
      console.error("Remote delete error:", err);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h3 className="fw-bold text-primary mb-0">Cyntax Question Bank Manager</h3>
        <div className="d-flex align-items-center gap-2">
          <label className="fw-bold small mb-0">Select Course:</label>
          <select 
            className="form-select fw-bold" 
            style={{ width: '200px' }}
            value={course} 
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="DCA">DCA</option>
            <option value="ADCA">ADCA</option>
            <option value="Steno">Steno</option>
            <option value="Short Term">Short Term</option>
            <option value="Tally">Tally Prime & Accounting</option>
            <option value="Basic">Basic Computer</option>
          </select>
          <button 
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={loadQuestions}
            title="Refresh Question Bank"
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      <div className="row">
        {/* Left: Add Question Form */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h5 className="fw-bold mb-3">Add New Question ({course})</h5>
            <form onSubmit={handleAddQuestion}>
              <div className="mb-3">
                <label className="small fw-bold">Question Statement</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Enter Question text..." 
                  value={form.q} 
                  onChange={(e) => setForm({ ...form, q: e.target.value })} 
                  required 
                />
              </div>

              <div className="mb-2">
                <label className="small fw-bold">Option A</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Option 1" 
                  value={form.o1} 
                  onChange={(e) => setForm({ ...form, o1: e.target.value })} 
                  required 
                />
              </div>

              <div className="mb-2">
                <label className="small fw-bold">Option B</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Option 2" 
                  value={form.o2} 
                  onChange={(e) => setForm({ ...form, o2: e.target.value })} 
                  required 
                />
              </div>

              <div className="mb-2">
                <label className="small fw-bold">Option C</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Option 3" 
                  value={form.o3} 
                  onChange={(e) => setForm({ ...form, o3: e.target.value })} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="small fw-bold">Option D</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Option 4" 
                  value={form.o4} 
                  onChange={(e) => setForm({ ...form, o4: e.target.value })} 
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="small fw-bold text-success">Correct Option</label>
                <select 
                  className="form-select border-success" 
                  value={form.a} 
                  onChange={(e) => setForm({ ...form, a: e.target.value })}
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                  <option value={2}>Option C is Correct</option>
                  <option value={3}>Option D is Correct</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow">
                Save Question to {course} Bank
              </button>
            </form>
          </div>
        </div>

        {/* Right: Question List */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
              <span>Active Questions in Bank</span>
              <div>
                {isLoading && <span className="badge bg-warning text-dark me-2">Syncing...</span>}
                <span className="badge bg-dark rounded-pill">{questions.length} Added</span>
              </div>
            </h5>

            {questions.length === 0 ? (
              <div className="p-4 text-center text-muted">
                Abhi is course mein question nahi dale gaye hain.
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {questions.map((q, idx) => (
                  <div key={q._id || q.id || idx} className="card p-3 mb-2 border rounded-3 bg-light position-relative">
                    <button 
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2" 
                      onClick={() => handleDelete(q)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <h6 className="fw-bold text-dark pe-4">Q{idx + 1}. {q.q}</h6>
                    <div className="small text-muted mt-2">
                      <div>A: {q.o && q.o[0]} {Number(q.a) === 0 && <b className="text-success">(Correct)</b>}</div>
                      <div>B: {q.o && q.o[1]} {Number(q.a) === 1 && <b className="text-success">(Correct)</b>}</div>
                      <div>C: {q.o && q.o[2]} {Number(q.a) === 2 && <b className="text-success">(Correct)</b>}</div>
                      <div>D: {q.o && q.o[3]} {Number(q.a) === 3 && <b className="text-success">(Correct)</b>}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageQuestions;