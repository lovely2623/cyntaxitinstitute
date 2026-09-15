import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageContent() {
  const [news, setNews] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [newNews, setNewNews] = useState({ tag: 'NEW', text: '' });
  const [newPdf, setNewPdf] = useState({ title: '', fileData: '' });
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [isNewsAdding, setIsNewsAdding] = useState(false);

  const BASE_URL = 'https://cyntaxitinstitute.onrender.com';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [n, p] = await Promise.all([
        axios.get(`${BASE_URL}/api/news`),
        axios.get(`${BASE_URL}/api/pdfs`)
      ]);
      setNews(n.data);
      setPdfs(p.data);
      localStorage.setItem('cyntax_cached_news', JSON.stringify(n.data));
      localStorage.setItem('cyntax_cached_pdfs', JSON.stringify(p.data));
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
      alert("Kripya sirf valid PDF file select karein!");
      e.target.value = null;
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("PDF file ka size 10MB se chhota hona chahiye!");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewPdf(prev => ({ ...prev, fileData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const addNews = async () => {
    if (!newNews.text.trim()) return alert("News text likhna zaroori hai!");
    setIsNewsAdding(true);
    try {
      await axios.post(`${BASE_URL}/api/news`, {
        tag: newNews.tag.trim() || 'NEW',
        text: newNews.text.trim()
      });
      setNewNews({ tag: 'NEW', text: '' });
      await fetchData();
      alert("News add ho gayi!");
    } catch (err) {
      alert("News upload fail ho gayi!");
    } finally {
      setIsNewsAdding(false);
    }
  };

  const addPdf = async () => {
    if (!newPdf.title.trim() || !newPdf.fileData) {
      return alert("Title aur PDF File dono select karein!");
    }

    setIsPdfUploading(true);
    try {
      await axios.post(`${BASE_URL}/api/pdfs`, {
        title: newPdf.title.trim(),
        link: newPdf.fileData
      });

      setNewPdf({ title: '', fileData: '' });
      const fileInput = document.getElementById('pdfFileInput');
      if (fileInput) fileInput.value = "";

      await fetchData();
      alert("PDF Successfully Upload Ho Gayi!");
    } catch (err) {
      console.error("PDF upload error:", err);
      alert("Upload fail hua! Connection check karein.");
    } finally {
      setIsPdfUploading(false);
    }
  };

  const deleteNews = async (id) => {
    if (window.confirm("Pakka news delete karni hai?")) {
      await axios.delete(`${BASE_URL}/api/news/${id}`);
      fetchData();
    }
  };

  const deletePdf = async (id) => {
    if (window.confirm("Pakka PDF delete karni hai?")) {
      await axios.delete(`${BASE_URL}/api/pdfs/${id}`);
      fetchData();
    }
  };

  const openPdfViewer = (base64OrUrl) => {
    if (!base64OrUrl) return alert("File data missing!");

    if (base64OrUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const byteCharacters = atob(base64OrUrl.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      } catch (e) {
        window.open(base64OrUrl, '_blank');
      }
    } else {
      window.open(base64OrUrl, '_blank');
    }
  };

  return (
    <div className="container-fluid p-4 position-relative">
      
      {/* FULL SCREEN SPINNER OVERLAY */}
      {isPdfUploading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <div className="spinner-border text-warning mb-3" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="fw-bold mb-1">PDF Upload Ho Rahi Hai...</h4>
          <p className="text-white-50 small mb-0">File process ho rahi hai, kripya wait karein aur back na karein.</p>
        </div>
      )}

      <h3 className="mb-4 fw-bold text-primary">Cyntax Content Manager</h3>
      
      <div className="row">
        {/* News Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3 border-0 rounded-4">
            <h5 className="fw-bold border-bottom pb-2">Latest News</h5>
            <div className="d-flex gap-2 mb-3">
              <input 
                type="text" 
                className="form-control w-25 fw-bold font-monospace" 
                value={newNews.tag} 
                onChange={(e) => setNewNews({...newNews, tag: e.target.value})} 
                placeholder="Tag (NEW/ALERT)"
              />
              <input 
                type="text" 
                className="form-control" 
                placeholder="News Text yahan likhein..." 
                value={newNews.text} 
                onChange={(e) => setNewNews({...newNews, text: e.target.value})} 
              />
              <button 
                className="btn btn-primary px-3 fw-bold" 
                disabled={isNewsAdding}
                onClick={addNews}
              >
                {isNewsAdding ? "Adding..." : "Add"}
              </button>
            </div>
            
            <ul className="list-group overflow-auto" style={{ maxHeight: '360px' }}>
              {news.length > 0 ? (
                news.map(item => (
                  <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span><b className="text-primary">{item.tag}:</b> {item.text}</span>
                    <button className="btn btn-danger btn-sm rounded-circle ms-2" onClick={() => deleteNews(item._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted text-center py-3">Koi news nahi hai.</li>
              )}
            </ul>
          </div>
        </div>

        {/* PDF Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3 border-0 rounded-4">
            <h5 className="fw-bold border-bottom pb-2">Upload Job PDF</h5>
            <div className="mb-3">
              <input 
                type="text" 
                className="form-control mb-2" 
                placeholder="PDF Title (e.g. HP Police Bharti 2026 PDF)" 
                value={newPdf.title} 
                onChange={(e) => setNewPdf({...newPdf, title: e.target.value})} 
              />
              <input 
                type="file" 
                id="pdfFileInput" 
                className="form-control mb-3" 
                accept=".pdf,application/pdf" 
                onChange={handleFileChange} 
              />
              <button 
                className="btn btn-success w-100 fw-bold py-2 shadow-sm rounded-pill" 
                disabled={isPdfUploading}
                onClick={addPdf}
              >
                {isPdfUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading PDF... Please Wait
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-upload me-2"></i> Upload & Save PDF
                  </>
                )}
              </button>
            </div>

            <ul className="list-group overflow-auto" style={{ maxHeight: '360px' }}>
              {pdfs.length > 0 ? (
                pdfs.map(item => (
                  <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="text-truncate fw-semibold" style={{ maxWidth: '65%' }} title={item.title}>
                      <i className="fas fa-file-pdf text-danger me-2"></i>{item.title}
                    </span>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1" 
                        onClick={() => openPdfViewer(item.link)}
                        title="View PDF"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-danger btn-sm rounded-circle" 
                        onClick={() => deletePdf(item._id)}
                        title="Delete PDF"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted text-center py-3">Koi PDF available nahi hai.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageContent;