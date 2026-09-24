import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  Sparkles, 
  Clock, 
  UserCheck, 
  BarChart3, 
  Cpu, 
  FileText,
  Star,
  Users
} from 'lucide-react';

export default function LandingPage({ 
  courses = [], 
  announcements = [], 
  onSelectCourse, 
  onGoToPortal, 
  onSwitchRole, 
  currentUser 
}) {
  return (
    <div className="space-y-14 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        {/* Subtle decorative background grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Ministry of Earth Sciences (MoES) • Smart Education Initiative</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            CAPACITY <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">CONNECT</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Centralized Digital Capacity Building & Competency Development Portal for 
            the <strong>India Meteorological Department (IMD)</strong>, <strong>NCMRWF</strong>, <strong>INCOIS</strong>, <strong>IITM</strong>, and <strong>NIOT</strong>.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => onGoToPortal('portal')}
              className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:translate-y-[-1px]"
            >
              <span>Enter {currentUser.role === 'trainee' ? 'Learning Room' : currentUser.role === 'trainer' ? 'Trainer Studio' : 'Admin Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGoToPortal('courses')}
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-white border border-slate-700 font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Browse 2026-27 Course Catalog</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 mt-10">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 text-left">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">5</div>
              <div className="text-xs text-slate-400 font-medium">MoES Premier Institutes</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 text-left">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">40+</div>
              <div className="text-xs text-slate-400 font-medium">Technical Specializations</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 text-left">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">2,400+</div>
              <div className="text-xs text-slate-400 font-medium">Certified Forecasters</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-750 text-left">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Verifiable QR Credentials</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Broadcast & Noticeboard Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-100 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 bg-sky-600 text-white rounded-lg">
              <Radio className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Official MoES Noticeboard & Live Announcements
            </h2>
            <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {announcements.slice(0, 4).map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span className="uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span>{item.publishedAt}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                    {item.content}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  By {item.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars: Role Capabilities for SIH Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Role-Based Architecture Tailored for MoES
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Switch roles instantly in the header to evaluate each module’s dedicated capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trainee Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-2 bg-emerald-500 absolute top-0 left-0 bottom-0" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Trainee Module
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Scientific Trainee & Forecaster</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Build your professional meteorological profile with technical competencies, qualifications, and past publications.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>One-click course enrollment & progress tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Timed subject-wise MCQ assessments with auto-evaluation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Download verifiable MoES / IMD digital certificates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Provide structured feedback & rating on training modules</span>
              </li>
            </ul>
            <button
              onClick={() => {
                onSwitchRole('trainee');
                onGoToPortal('portal');
              }}
              className="mt-6 w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-1.5"
            >
              <span>Test as Trainee (Ananya Sharma)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trainer Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-2 bg-indigo-500 absolute top-0 left-0 bottom-0" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <Users className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Trainer Module
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Faculty & Senior Scientist</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Design curricula, author questionnaires with deadlines, and upload presentations and scientific lecture recordings.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Interactive MCQ Assessment Studio with deadlines & keys</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Trainee Gradebook with pass/fail and performance analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Trainer Resource Library for lectures, NetCDF data & SOPs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Manage academic credentials & specialization mapping</span>
              </li>
            </ul>
            <button
              onClick={() => {
                onSwitchRole('trainer');
                onGoToPortal('portal');
              }}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl transition-colors border border-indigo-200 flex items-center justify-center gap-1.5"
            >
              <span>Test as Trainer (Dr. Rajeshwar Rao)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-2 bg-rose-500 absolute top-0 left-0 bottom-0" />
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                Admin Command
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Capacity Building Directorate</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Approve users, review institutional statistics, publish portal announcements, and run competency mapping.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>User Approval Queue for pending faculty registrations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>Competency Mapping Engine</strong>: Trainer matching algorithm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Institutional breakdown: IMD, IITM, NCMRWF, INCOIS, NIOT</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Noticeboard publisher for bulletins & new course alerts</span>
              </li>
            </ul>
            <button
              onClick={() => {
                onSwitchRole('admin');
                onGoToPortal('portal');
              }}
              className="mt-6 w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl transition-colors border border-rose-200 flex items-center justify-center gap-1.5"
            >
              <span>Test as Admin (Smt. V. Meenakshi)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Earth Science Modules</h2>
            <p className="text-xs text-slate-500 mt-1">
              Curated by senior scientists from IMD, INCOIS, and NCMRWF for national capacity building.
            </p>
          </div>
          <button
            onClick={() => onGoToPortal('courses')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All Programs ({courses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {course.domain}
                  </div>
                  <div className="absolute top-3 right-3 bg-sky-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {course.code}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{course.institution}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {course.rating}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Trainer: <span className="font-semibold text-slate-800">{course.trainerName}</span>
                </div>
                <button
                  onClick={() => onSelectCourse(course.id)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
