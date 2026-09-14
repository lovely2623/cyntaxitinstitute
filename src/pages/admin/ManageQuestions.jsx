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

  // 1. Direct Server Load (Server is the Ultimate Source of Truth)
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
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
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (err) {
      console.warn("Server fetch failed, falling back to local storage:", err);
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) setQuestions(parsed);
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  }, [course, storageKey, BASE_URL]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // 2. Add Question Handler (Server first, then sync state)
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
      course: course.trim().toUpperCase()
    };

    try {
      const res = await fetch(`${BASE_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });

      if (res.ok) {
        const savedData = await res.json();
        const finalItem = (savedData && (savedData._id || savedData.id)) ? savedData : newQ;
        const updated = [...questions, finalItem];
        setQuestions(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setForm({ q: '', o1: '', o2: '', o3: '', o4: '', a: 0 });
        alert(`Question successfully database mein save ho gaya! Total: ${updated.length}`);
      } else {
        alert("Server error: Question save nahi ho paya!");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error! Server online nahi hai.");
    }
  };

  // 3. Complete Hard Delete Handler (Permanently removes from Database & LocalStorage)
  const handleDelete = async (questionObj) => {
    const targetId = questionObj._id || questionObj.id;
    if (!window.confirm("Bhai ye question pakka delete karna hai? Yeh database se hamesha ke liye hat jayega!")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/questions/${targetId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Sirf tab frontend se remove karein jab server confirm kare
        const updated = questions.filter(q => {
          if (questionObj._id && q._id) return q._id !== questionObj._id;
          return q.id !== questionObj.id;
        });
        setQuestions(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        alert("Question successfully delete ho gaya!");
      } else {
        alert("Server se delete nahi ho saka. Kripya dobara try karein.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error! Question delete nahi ho paya.");
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
                Abhi is course mein koi question add nahi hai.
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {questions.map((q, idx) => (
                  <div key={q._id || q.id || idx} className="card p-3 mb-2 border rounded-3 bg-light position-relative">
                    <button 
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2" 
                      onClick={() => handleDelete(q)}
                      title="Delete Question"
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