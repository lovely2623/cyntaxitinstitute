import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageContent() {
  const [news, setNews] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [newNews, setNewNews] = useState({ tag: 'NEW', text: '' });
  const [newPdf, setNewPdf] = useState({ title: '', fileData: '' }); // link ki jagah fileData

  const BASE_URL = 'https://cyntaxitinstitute.onrender.com';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const n = await axios.get(`${BASE_URL}/api/news`);
      const p = await axios.get(`${BASE_URL}/api/pdfs`);
      setNews(n.data);
      setPdfs(p.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // PDF File ko Base64 mein convert karne ke liye function
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setNewPdf({ ...newPdf, fileData: reader.result });
      };
    } else {
      alert("Bhai sirf PDF file hi select karo!");
      e.target.value = null;
    }
  };

  const addNews = async () => {
    if(!newNews.text) return alert("News text likho!");
    try {
      await axios.post(`${BASE_URL}/api/news`, newNews);
      setNewNews({ tag: 'NEW', text: '' });
      fetchData();
      alert("News added!");
    } catch (err) { alert("News failed!"); }
  };

  const addPdf = async () => {
    if(!newPdf.title || !newPdf.fileData) return alert("Title aur File dono select karo!");
    try {
      // Backend mein hum 'link' field mein hi Base64 data bhej rahe hain taaki schema change na karna pade
      await axios.post(`${BASE_URL}/api/pdfs`, { title: newPdf.title, link: newPdf.fileData });
      setNewPdf({ title: '', fileData: '' });
      document.getElementById('pdfFileInput').value = ""; // Clear file input
      fetchData();
      alert("PDF Uploaded Successfully!");
    } catch (err) { alert("Upload failed!"); }
  };

  const deleteNews = async (id) => {
    if(window.confirm("Delete news?")) {
      await axios.delete(`${BASE_URL}/api/news/${id}`);
      fetchData();
    }
  };

  const deletePdf = async (id) => {
    if(window.confirm("Delete PDF?")) {
      await axios.delete(`${BASE_URL}/api/pdfs/${id}`);
      fetchData();
    }
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-4 fw-bold text-primary">Cyntax Content Manager</h3>
      <div className="row">
        {/* News Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="fw-bold border-bottom pb-2">Latest News</h5>
            <div className="d-flex gap-2 mb-3">
              <input type="text" className="form-control w-25" value={newNews.tag} onChange={(e) => setNewNews({...newNews, tag: e.target.value})} />
              <input type="text" className="form-control" placeholder="News Text" value={newNews.text} onChange={(e) => setNewNews({...newNews, text: e.target.value})} />
              <button className="btn btn-primary" onClick={addNews}>Add</button>
            </div>
            <ul className="list-group overflow-auto" style={{maxHeight:'300px'}}>
              {news.map(item => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span><b>{item.tag}:</b> {item.text}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteNews(item._id)}><i className="fas fa-trash"></i></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PDF Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="fw-bold border-bottom pb-2">Upload Job PDF</h5>
            <div className="mb-3">
              <input type="text" className="form-control mb-2" placeholder="PDF Title" value={newPdf.title} onChange={(e) => setNewPdf({...newPdf, title: e.target.value})} />
              <input type="file" id="pdfFileInput" className="form-control mb-2" accept=".pdf" onChange={handleFileChange} />
              <button className="btn btn-success w-100" onClick={addPdf}>Upload & Save PDF</button>
            </div>
            <ul className="list-group overflow-auto" style={{maxHeight:'300px'}}>
              {pdfs.map(item => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="text-truncate" style={{maxWidth:'80%'}}>{item.title}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => deletePdf(item._id)}><i className="fas fa-trash"></i></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageContent;