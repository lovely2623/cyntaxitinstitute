import React, { useState, useEffect } from 'react';

function ManageQuestions() {
  const [course, setCourse] = useState('DCA');
  const [questions, setQuestions] = useState([]);
  
  const [form, setForm] = useState({
    q: '',
    o1: '',
    o2: '',
    o3: '',
    o4: '',
    a: 0
  });

  const storageKey = `cyntax_questions_${course}`;

  const loadQuestions = () => {
    const data = localStorage.getItem(`cyntax_questions_${course}`);
    if (data) {
      try {
        setQuestions(JSON.parse(data));
      } catch (e) {
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [course]);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!form.q || !form.o1 || !form.o2 || !form.o3 || !form.o4) {
      alert("Saari fields bharein!");
      return;
    }

    const newQ = {
      id: Date.now(),
      q: form.q,
      o: [form.o1, form.o2, form.o3, form.o4],
      a: parseInt(form.a)
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setForm({ q: '', o1: '', o2: '', o3: '', o4: '', a: 0 });
    alert(`Question Add Ho Gaya! Total: ${updated.length}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bhai ye question delete karna hai?")) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
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
            style={{ width: '180px' }}
            value={course} 
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="DCA">DCA</option>
            <option value="Steno">Steno</option>
            <option value="Short Term">Short Term</option>
          </select>
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
              <span className="badge bg-dark rounded-pill">{questions.length} Added</span>
            </h5>

            {questions.length === 0 ? (
              <div className="p-4 text-center text-muted">
                Abhi is course mein custom question nahi dale hain. (Default system questions run honge).
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} className="card p-3 mb-2 border rounded-3 bg-light position-relative">
                    <button 
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                      onClick={() => handleDelete(q.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <h6 className="fw-bold text-dark pe-4">Q{idx + 1}. {q.q}</h6>
                    <div className="small text-muted mt-2">
                      <div>A: {q.o[0]} {q.a === 0 && <b className="text-success">(Correct)</b>}</div>
                      <div>B: {q.o[1]} {q.a === 1 && <b className="text-success">(Correct)</b>}</div>
                      <div>C: {q.o[2]} {q.a === 2 && <b className="text-success">(Correct)</b>}</div>
                      <div>D: {q.o[3]} {q.a === 3 && <b className="text-success">(Correct)</b>}</div>
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