import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  BookOpen, 
  Bell, 
  Compass, 
  LogOut, 
  ChevronDown,
  Layers,
  Sparkles,
  Languages
} from 'lucide-react';
import { translations } from '../services/translations';

export default function Navbar({ 
  currentUser, 
  onSwitchRole, 
  activeTab, 
  setActiveTab,
  lang = 'en',
  setLang
}) {
  const t = translations[lang] || translations.en;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Tricolor Government Top Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & MoES Crest */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 via-sky-800 to-indigo-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-7 h-7 text-sky-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                  {lang === 'hi' ? 'क्षमता ' : 'CAPACITY '}<span className="text-sky-600 font-extrabold">{lang === 'hi' ? 'सेतु' : 'CONNECT'}</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
                  MoES • IMD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t.portalSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'home' 
                  ? 'bg-sky-50 text-sky-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'courses' 
                  ? 'bg-sky-50 text-sky-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.courses}
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'portal' 
                  ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>
                {currentUser.role === 'trainee' && t.learningRoom}
                {currentUser.role === 'trainer' && t.trainerStudio}
                {currentUser.role === 'admin' && t.adminCenter}
              </span>
            </button>
          </nav>

          {/* Right Section: Language Toggle, 1-Click Role Switcher & User Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Government Bilingual Toggle (Official Languages Act) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setLang && setLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English"
              >
                ENG
              </button>
              <button
                onClick={() => setLang && setLang('hi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'hi'
                    ? 'bg-white text-orange-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="राजभाषा हिंदी"
              >
                हिन्दी
              </button>
            </div>

            {/* Quick Demo Role Switcher (For SIH Evaluators) */}
            <div className="relative">
              <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                <span className="text-slate-400 pl-2 pr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {t.evaluateRole}
                </span>
                <button
                  onClick={() => onSwitchRole('trainee')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    currentUser.role === 'trainee'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to Trainee (Ananya Sharma)"
                >
                  {t.trainee}
                </button>
                <button
                  onClick={() => onSwitchRole('trainer')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    currentUser.role === 'trainer'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to Trainer (Dr. Rajeshwar Rao)"
                >
                  {t.trainer}
                </button>
                <button
                  onClick={() => onSwitchRole('admin')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    currentUser.role === 'admin'
                      ? 'bg-white text-rose-700 shadow-xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to Admin (Smt. V. Meenakshi)"
                >
                  {t.admin}
                </button>
              </div>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-full border-2 border-white shadow-xs object-cover" 
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${
                  currentUser.role === 'admin' ? 'text-rose-600' :
                  currentUser.role === 'trainer' ? 'text-indigo-600' : 'text-emerald-600'
                }`}>
                  {currentUser.role}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
