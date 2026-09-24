import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Award, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function CourseCatalog({ 
  courses = [], 
  enrollments = [], 
  onEnroll, 
  currentUser, 
  onSelectCourse 
}) {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const domains = [
    'All',
    'Radar Meteorology',
    'Atmospheric Modeling',
    'Satellite Meteorology',
    'Ocean Science & Hazards',
    'Geophysics & Seismology'
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesDomain = selectedDomain === 'All' || c.domain.toLowerCase().includes(selectedDomain.toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.code.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Filter Controls */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            MoES Technical Capacity Building Programs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Standardized training curriculum for operational officers, researchers, and scientific assistants.
          </p>
        </div>

        {/* Search Bar & Domain Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by course code, topic, or radar keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedDomain === dom
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((c) => {
          const enrolled = isEnrolled(c.id);

          return (
            <div 
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={c.thumbnail} 
                    alt={c.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {c.domain}
                  </div>
                  <div className="absolute top-3 right-3 bg-sky-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    {c.code}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{c.institution}</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {c.rating} ({c.reviewCount || 20})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {c.duration}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-700">
                      Faculty: {c.trainerName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                {enrolled ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enrolled</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onEnroll(c.id)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    1-Click Enroll
                  </button>
                )}

                <button
                  onClick={() => onSelectCourse(c.id)}
                  className="text-xs font-bold text-slate-600 hover:text-sky-600 flex items-center gap-1 transition-colors"
                >
                  <span>Syllabus & Info</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
