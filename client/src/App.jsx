import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import TraineePortal from './components/TraineePortal';
import TrainerPortal from './components/TrainerPortal';
import AdminPortal from './components/AdminPortal';
import CourseCatalog from './components/CourseCatalog';
import CertificateModal from './components/CertificateModal';
import AuthModal from './components/AuthModal';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // home, courses, portal
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [activeCertificateId, setActiveCertificateId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');


  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      // Default initial login as Trainee for SIH evaluation
      const authRes = await api.switchDemoRole('trainee');
      setCurrentUser(authRes.user);

      const [crs, anc, enr] = await Promise.all([
        api.getCourses(),
        api.getAnnouncements(),
        api.getEnrollments(authRes.user.id)
      ]);

      setCourses(crs);
      setAnnouncements(anc);
      setEnrollments(enr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (targetRole) => {
    try {
      setLoading(true);
      const res = await api.switchDemoRole(targetRole);
      setCurrentUser(res.user);

      // Refresh enrollments for the new user
      const enr = await api.getEnrollments(res.user.id);
      setEnrollments(enr);

      // Auto switch to portal view when switching role
      setActiveTab('portal');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!currentUser) return;
    try {
      const res = await api.enrollCourse(currentUser.id, courseId);
      const enr = await api.getEnrollments(currentUser.id);
      setEnrollments(enr);
      alert('Successfully enrolled in the program! Opening your learning room.');
      setActiveTab('portal');
    } catch (e) {
      console.error(e);
      alert('Enrollment failed.');
    }
  };

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    if (user.role === 'trainee') {
      const enr = await api.getEnrollments(user.id);
      setEnrollments(enr);
    }
    setActiveTab('portal');
  };

  const handleSelectCourse = (courseId) => {
    setActiveTab('portal');
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Connecting to Ministry of Earth Sciences Capacity Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Universal Navbar with 1-Click Role Switcher */}
      <Navbar 
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage 
            courses={courses}
            announcements={announcements}
            onSelectCourse={handleSelectCourse}
            onGoToPortal={setActiveTab}
            onSwitchRole={handleSwitchRole}
            currentUser={currentUser}
            lang={lang}
          />
        )}

        {activeTab === 'courses' && (
          <CourseCatalog 
            courses={courses}
            enrollments={enrollments}
            onEnroll={handleEnroll}
            currentUser={currentUser}
            onSelectCourse={handleSelectCourse}
            lang={lang}
          />
        )}

        {activeTab === 'portal' && (
          <div>
            {currentUser.role === 'trainee' && (
              <TraineePortal 
                currentUser={currentUser}
                onViewCertificate={(certId) => setActiveCertificateId(certId)}
                onRefreshUser={() => handleSwitchRole('trainee')}
                lang={lang}
              />
            )}

            {currentUser.role === 'trainer' && (
              <TrainerPortal 
                currentUser={currentUser}
                onRefreshData={() => handleSwitchRole('trainer')}
              />
            )}
            {currentUser.role === 'admin' && (
              <AdminPortal 
                currentUser={currentUser}
              />
            )}
          </div>
        )}
      </main>

      {/* Official MoES Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <div className="text-sm font-bold text-white tracking-wide">
                CAPACITY CONNECT • Ministry of Earth Sciences (MoES)
              </div>
              <p className="text-xs text-slate-400 mt-1">
                India Meteorological Department (IMD) • NCMRWF • INCOIS • IITM • NIOT
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Smart India Hackathon (SIH) 2026 Submission • Problem Statement 26075
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>© 2026 Government of India. All rights reserved. Designed for Organizational Capacity Building.</span>
            <div className="flex items-center gap-4">
              <span>National Security Standards</span>
              <span>•</span>
              <span>ISO 9001:2015 Compliant</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Verifiable Certificate Modal */}
      {activeCertificateId && (
        <CertificateModal 
          certificateId={activeCertificateId}
          onClose={() => setActiveCertificateId(null)}
        />
      )}

      {/* Real MoES Authentication & Registration Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
