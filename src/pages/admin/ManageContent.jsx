import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageContent() {
  const [news, setNews] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [newNews, setNewNews] = useState({ tag: 'NEW', text: '' });
  const [newPdf, setNewPdf] = useState({ title: '', link: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const n = await axios.get('http://localhost:5000/api/news');
    const p = await axios.get('http://localhost:5000/api/pdfs');
    setNews(n.data);
    setPdfs(p.data);
  };

  const addNews = async () => {
    await axios.post('http://localhost:5000/api/news', newNews);
    setNewNews({ tag: 'NEW', text: '' });
    fetchData();
  };

  const addPdf = async () => {
    await axios.post('http://localhost:5000/api/pdfs', newPdf);
    setNewPdf({ title: '', link: '' });
    fetchData();
  };

  const deleteNews = async (id) => {
    await axios.delete(`http://localhost:5000/api/news/${id}`);
    fetchData();
  };

  const deletePdf = async (id) => {
    await axios.delete(`http://localhost:5000/api/pdfs/${id}`);
    fetchData();
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-4 fw-bold">Manage Website Content</h3>
      
      <div className="row">
        {/* Manage News */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="fw-bold border-bottom pb-2">Latest News</h5>
            <div className="d-flex gap-2 mb-3">
              <input type="text" className="form-control w-25" placeholder="Tag (NEW)" value={newNews.tag} onChange={(e) => setNewNews({...newNews, tag: e.target.value})} />
              <input type="text" className="form-control" placeholder="News Text" value={newNews.text} onChange={(e) => setNewNews({...newNews, text: e.target.value})} />
              <button className="btn btn-primary" onClick={addNews}>Add</button>
            </div>
            <ul className="list-group">
              {news.map(item => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span><b>{item.tag}:</b> {item.text}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteNews(item._id)}><i className="fas fa-trash"></i></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Manage PDFs */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3">
            <h5 className="fw-bold border-bottom pb-2">Job PDFs</h5>
            <div className="mb-3">
              <input type="text" className="form-control mb-2" placeholder="PDF Title" value={newPdf.title} onChange={(e) => setNewPdf({...newPdf, title: e.target.value})} />
              <input type="text" className="form-control mb-2" placeholder="PDF Link (Google Drive/URL)" value={newPdf.link} onChange={(e) => setNewPdf({...newPdf, link: e.target.value})} />
              <button className="btn btn-success w-100" onClick={addPdf}>Add PDF</button>
            </div>
            <ul className="list-group">
              {pdfs.map(item => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{item.title}</span>
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