import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import Facilities from './components/Facilities';
import Courses from './pages/Courses'; 
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Verification from './pages/Verification';
import OnlineTest from './pages/OnlineTest';
import StudentTestPortal from './pages/StudentTestPortal';

// ADMIN PAGES IMPORT
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import StudentList from './pages/admin/StudentList';
import AddStudent from './pages/admin/AddStudent';
import ManageContent from './pages/admin/ManageContent';
import Certificate from './pages/admin/Certificate';
import ManageQuestions from './pages/admin/ManageQuestions';

// --- SCROLL TO TOP & SESSION WATCHDOG ---
const RouteWatchdog = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Agar admin layout se bahar kisi bhi page par navigation ho, session clear ho jaye
    const currentPath = pathname.toLowerCase();
    const isAdminArea = currentPath.startsWith('/adminlayout') || currentPath.startsWith('/login');
    if (!isAdminArea && localStorage.getItem('isAdminAuthenticated') === 'true') {
      localStorage.removeItem('isAdminAuthenticated');
    }
  }, [pathname]);

  return null;
};

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
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch(`/index.html?nocache=${new Date().getTime()}`, { 
          method: 'HEAD' 
        });
        const etag = response.headers.get('ETag') || response.headers.get('Last-Modified');
        const lastEtag = localStorage.getItem('app-version-etag');

        if (lastEtag && lastEtag !== etag) {
          console.log("Naya update mila hai! Reloading...");
          localStorage.setItem('app-version-etag', etag);
          window.location.reload();
        } else if (etag) {
          localStorage.setItem('app-version-etag', etag);
        }
      } catch (error) {
        console.log("Update check failed", error);
      }
    };

    const interval = setInterval(() => {
      checkUpdates();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <RouteWatchdog /> 
      
      <div>
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
          <Route path="/Test" element={<StudentTestPortal />} />

          {/* EXAM PORTAL */}
          <Route path="/online-test" element={<OnlineTest />} />

          {/* ADMIN PANEL ROUTES */}
          <Route path="/AdminLayout" element={<AdminLayout />}>
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="StudentList" element={<StudentList />} />
            <Route path="AddStudent" element={<AddStudent />} /> 
            <Route path="ManageContent" element={<ManageContent />} />
            <Route path="ManageQuestions" element={<ManageQuestions />} />
            <Route path="Certificate" element={<Certificate />} />
          </Route>
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;