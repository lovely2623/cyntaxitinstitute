import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Mini from './components/Mini';
import Footer from './components/Footer';
import Facilities from './components/Facilities';
import Courses from './pages/Courses'; 
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Verification from './pages/Verification';

// ADMIN PAGES IMPORT
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import StudentList from './pages/admin/StudentList';
import AddStudent from './pages/admin/AddStudent';

// --- SCROLL TO TOP LOGIC ---
// Ye component har route change par screen ko upar le jayega
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Home page component
function Home() {
  return (
    <>
      <Hero />
      <InfoSection />
      <Facilities />
    </>
  );
}

function App() {
  return (
    <Router>
      {/* ScrollToTop ko Router ke andar rakhna zaroori hai */}
      <ScrollToTop /> 
      
      <div>
        <Mini />
        <Navbar />
        
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/Gallery" element={<Gallery />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Verification" element={<Verification />} />

          {/* ADMIN PANEL ROUTES */}
          {/* Admin routes ko thoda short kar diya hai */}
          <Route path="/AdminLayout" element={<AdminLayout />}>
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="StudentList" element={<StudentList />} />
            <Route path="AddStudent" element={<AddStudent />} /> 
          </Route>
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;