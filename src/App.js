import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Core Critical Components (Instant bundle)
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import Facilities from './components/Facilities';

// Lazy Loaded Pages (Code-splitting: only downloaded when navigated)
const Courses = lazy(() => import('./pages/Courses'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Login = lazy(() => import('./pages/Login'));
const Verification = lazy(() => import('./pages/Verification'));
const OnlineTest = lazy(() => import('./pages/OnlineTest'));
const StudentTestPortal = lazy(() => import('./pages/StudentTestPortal'));

// Heavy Admin Components Lazy Loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const StudentList = lazy(() => import('./pages/admin/StudentList'));
const AddStudent = lazy(() => import('./pages/admin/AddStudent'));
const ManageContent = lazy(() => import('./pages/admin/ManageContent'));
const Certificate = lazy(() => import('./pages/admin/Certificate'));
const ManageQuestions = lazy(() => import('./pages/admin/ManageQuestions'));

// Route Watchdog
const RouteWatchdog = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const currentPath = pathname.toLowerCase();
    const isAdminArea = currentPath.startsWith('/adminlayout') || currentPath.startsWith('/login');
    if (!isAdminArea && localStorage.getItem('isAdminAuthenticated') === 'true') {
      localStorage.removeItem('isAdminAuthenticated');
    }
  }, [pathname]);

  return null;
};

// Lightweight Page Loader Fallback
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

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
          localStorage.setItem('app-version-etag', etag);
          window.location.reload();
        } else if (etag) {
          localStorage.setItem('app-version-etag', etag);
        }
      } catch {}
    };

    // 60-second check instead of 30-second to prevent network choking
    const interval = setInterval(checkUpdates, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <RouteWatchdog /> 
      
      <div>
        <Navbar />
        
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>

        <Footer />
      </div>
    </Router>
  );
}

export default App;