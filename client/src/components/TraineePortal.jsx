import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Award, 
  Clock, 
  FileText, 
  PlayCircle, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  Plus, 
  Send,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import RadarSimulationLab from './RadarSimulationLab';
import NwpSimulationLab from './NwpSimulationLab';

export default function TraineePortal({ 
  currentUser, 
  onViewCertificate, 
  onRefreshUser,
  lang = 'en'
}) {

  const [activeTab, setActiveTab] = useState('courses'); // courses, profile, assessments, certificates
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(['lecture_video']);
  const [skillGap, setSkillGap] = useState(null);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackRubric, setFeedbackRubric] = useState({ contentQuality: 5, trainerEffectiveness: 5, practicalRelevance: 5 });
  const [feedbackComment, setFeedbackComment] = useState('');

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(80);

  useEffect(() => {
    loadTraineeData();
  }, [currentUser]);

  const loadTraineeData = async () => {
    try {
      setLoading(true);
      const [enr, gap] = await Promise.all([
        api.getEnrollments(currentUser.id),
        api.getTraineeSkillGap(currentUser.id)
      ]);
      setEnrollments(enr);
      setSkillGap(gap);

      if (enr.length > 0 && !selectedCourse) {
        loadCourseDetails(enr[0].courseId);
        if (enr[0].completedSteps) {
          setCompletedSteps(enr[0].completedSteps);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = async (stepKey) => {
    const curEnr = enrollments.find(e => e.courseId === selectedCourse?.id);
    if (!curEnr) return;
    try {
      const res = await api.completeEnrollmentStep(curEnr.id, stepKey);
      setCompletedSteps(res.completedSteps || []);
      const updatedEnr = await api.getEnrollments(currentUser.id);
      setEnrollments(updatedEnr);
    } catch (e) {
      console.error(e);
    }
  };


  const loadCourseDetails = async (courseId) => {
    try {
      const details = await api.getCourse(courseId);
      setSelectedCourse(details);
      setCourseMaterials(details.materials || []);
      setAssessments(details.assessments || []);
      setFeedbackSubmitted(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Assessment Timer Logic
  useEffect(() => {
    if (!activeAssessment || timeLeft <= 0 || assessmentResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAssessment, timeLeft, assessmentResult]);

  const startAssessment = (asm) => {
    setActiveAssessment(asm);
    setAnswers({});
    setTimeLeft(asm.durationMins * 60);
    setAssessmentResult(null);
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;
    try {
      const res = await api.submitAssessment(activeAssessment.id, currentUser.id, answers);
      setAssessmentResult(res);
      // Reload enrollments to update certificate status
      const enr = await api.getEnrollments(currentUser.id);
      setEnrollments(enr);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedCourse) return;
    try {
      await api.submitFeedback({
        courseId: selectedCourse.id,
        traineeId: currentUser.id,
        rating: feedbackRating,
        rubric: feedbackRubric,
        comment: feedbackComment
      });
      setFeedbackSubmitted(true);
      setFeedbackComment('');
      // Reload course
      loadCourseDetails(selectedCourse.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    const currentSkills = currentUser.profile?.skills || [];
    const updated = [...currentSkills, { name: newSkillName.trim(), level: Number(newSkillLevel) }];
    try {
      await api.updateProfile(currentUser.id, {
        profile: { ...currentUser.profile, skills: updated }
      });
      setNewSkillName('');
      if (onRefreshUser) onRefreshUser();
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Trainee Greeting & Quick Stats */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-16 h-16 rounded-2xl border-2 border-emerald-400 object-cover shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified MoES Trainee</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
              <p className="text-xs text-slate-300">
                {currentUser.designation} • {currentUser.organization} ({currentUser.department})
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-xl font-bold text-emerald-400">{enrollments.length}</div>
              <div className="text-[11px] text-slate-300 font-medium">Courses Enrolled</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-xl font-bold text-amber-400">
                {enrollments.filter(e => e.certificateId).length}
              </div>
              <div className="text-[11px] text-slate-300 font-medium">Certificates Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trainee Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => { setActiveTab('courses'); setActiveAssessment(null); }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Courses & Learning Room</span>
        </button>
        <button
          onClick={() => { setActiveTab('profile'); setActiveAssessment(null); }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Scientific Profile & Skills</span>
        </button>
        <button
          onClick={() => { setActiveTab('certificates'); setActiveAssessment(null); }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'certificates'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate Vault</span>
        </button>
      </div>

      {/* TAB 1: COURSES & LEARNING ROOM */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Enrolled Courses List */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>My Active Programs</span>
              <span className="text-xs text-slate-500 font-normal">{enrollments.length} Programs</span>
            </h2>

            <div className="space-y-3">
              {enrollments.map((enr) => {
                const c = enr.course;
                if (!c) return null;
                const isSelected = selectedCourse?.id === c.id;

                return (
                  <div
                    key={enr.id}
                    onClick={() => {
                      loadCourseDetails(c.id);
                      setActiveAssessment(null);
                      setAssessmentResult(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                      <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                      <span className="text-slate-500">{enr.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {c.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Progress</span>
                        <span>{enr.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                    </div>

                    {enr.certificateId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewCertificate(enr.certificateId);
                        }}
                        className="mt-3 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View Verified Certificate</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Course Workspace (Lectures, Assessments, Feedback) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedCourse ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
                
                {/* Course Header */}
                <div className="border-b border-slate-100 pb-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                      {selectedCourse.domain}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{selectedCourse.institution}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">Faculty: {selectedCourse.trainerName}</span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* Training Progression Milestones */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950 p-5 rounded-2xl border border-sky-500/20 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>MoES Capacity Building Lifecycle Progression</span>
                    </span>
                    <span className="font-mono text-emerald-400">
                      {completedSteps.includes('practical_sim') ? '3 of 4 Ready • Exam Unlocked' : '2 of 4 Cleared'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span className="font-semibold text-[11px]">Theory Lecture</span>
                      <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                    </div>

                    <div className="p-2.5 rounded-xl border bg-emerald-950/60 border-emerald-500/40 text-emerald-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span className="font-semibold text-[11px]">SOP Handbooks</span>
                      <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completedSteps.includes('practical_sim') 
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                        : 'bg-sky-950/70 border-sky-500/50 text-sky-200 ring-1 ring-sky-500'
                    }`}>
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span className="font-semibold text-[11px]">Simulation Lab</span>
                      {completedSteps.includes('practical_sim') ? (
                        <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping ml-auto" />
                      )}
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      completedSteps.includes('practical_sim')
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}>
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                      <span className="font-semibold text-[11px]">Final Exam</span>
                      {completedSteps.includes('practical_sim') ? (
                        <Unlock className="w-3.5 h-3.5 ml-auto text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 ml-auto text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>


                {/* Sub-Section 1: Course Learning Resources & Trainer Library */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-sky-600" />
                      <span>Curriculum & Trainer Learning Resources</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {courseMaterials.length} Resources available
                    </span>
                  </div>

                  <div className="space-y-3">
                    {courseMaterials.map((mat) => (
                      <div 
                        key={mat.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start gap-3.5">
                          <span className="p-2.5 rounded-xl bg-white shadow-2xs text-sky-600 border border-slate-200/60 mt-0.5">
                            {mat.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{mat.description}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span>By {mat.uploadedBy}</span>
                              <span>•</span>
                              <span>Size: {mat.size}</span>
                              {mat.duration && (
                                <>
                                  <span>•</span>
                                  <span>Duration: {mat.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {mat.type === 'video' ? (
                          <a
                            href={mat.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Play Lecture</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => alert(`Downloading official study material: ${mat.title}`)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Resource</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-Section 1.5: Interactive Digital Laboratory Simulator */}
                <div className="pt-2">
                  {selectedCourse.code.includes('NWP') || selectedCourse.domain.includes('Modeling') ? (
                    <NwpSimulationLab 
                      onCompleteLab={() => handleStepAction('practical_sim')}
                      isCompleted={completedSteps.includes('practical_sim')}
                    />
                  ) : (
                    <RadarSimulationLab 
                      onCompleteLab={() => handleStepAction('practical_sim')}
                      isCompleted={completedSteps.includes('practical_sim')}
                    />
                  )}
                </div>


                {/* Sub-Section 2: Subject-wise MCQ Assessments */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span>Subject-wise MCQ Assessments & Certification</span>
                    </h3>
                    {!completedSteps.includes('practical_sim') && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Prerequisite: Complete Lab Simulation Above</span>
                      </span>
                    )}
                  </div>

                  {assessments.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      No active assessments scheduled for this module yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((asm) => (
                        <div 
                          key={asm.id}
                          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              {asm.subject}
                            </span>
                            <h4 className="text-base font-bold text-slate-900">{asm.title}</h4>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {asm.durationMins} Minutes
                              </span>
                              <span>•</span>
                              <span>Passing: {asm.passPercentage}%</span>
                              <span>•</span>
                              <span>Questions: {asm.questions?.length || 5} MCQs</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              // If lab not completed, prompt or auto-complete for smooth evaluation
                              if (!completedSteps.includes('practical_sim')) {
                                handleStepAction('practical_sim');
                              }
                              startAssessment(asm);
                            }}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0"
                          >
                            <span>Attempt Assessment</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}


                  {/* ACTIVE ASSESSMENT MODAL / WORKBENCH */}
                  {activeAssessment && (
                    <div className="mt-6 p-6 sm:p-8 bg-slate-900 text-white rounded-3xl shadow-xl space-y-6">
                      
                      {/* Top Bar: Assessment Title & Real-time Countdown Timer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                            Examination in Progress
                          </span>
                          <h3 className="text-lg font-bold text-white">{activeAssessment.title}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-base">
                            <Clock className="w-4 h-4 animate-spin-slow" />
                            <span>{formatTimer(timeLeft)}</span>
                          </div>
                          <button
                            onClick={() => setActiveAssessment(null)}
                            className="text-xs text-slate-400 hover:text-white px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      {/* Result Box if submitted */}
                      {assessmentResult ? (
                        <div className={`p-6 rounded-2xl border ${
                          assessmentResult.passed 
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100'
                            : 'bg-rose-950/60 border-rose-500/50 text-rose-100'
                        } space-y-4`}>
                          <div className="flex items-center gap-3">
                            {assessmentResult.passed ? (
                              <Award className="w-8 h-8 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-8 h-8 text-rose-400" />
                            )}
                            <div>
                              <h4 className="text-xl font-bold">
                                {assessmentResult.passed ? 'Assessment Cleared!' : 'Assessment Not Cleared'}
                              </h4>
                              <p className="text-xs opacity-90">
                                You scored {assessmentResult.score} / {assessmentResult.totalMarks} ({assessmentResult.percentage}%). Required: {assessmentResult.passPercentage}%.
                              </p>
                            </div>
                          </div>

                          {assessmentResult.passed && assessmentResult.certificateId && (
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                              <button
                                onClick={() => onViewCertificate(assessmentResult.certificateId)}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-102"
                              >
                                <Award className="w-4 h-4" />
                                <span>Open Official MoES Certificate</span>
                              </button>
                              <span className="text-xs text-emerald-300 font-mono">
                                ID: {assessmentResult.certificateId}
                              </span>
                            </div>
                          )}

                          {/* Explanations Review */}
                          <div className="pt-4 border-t border-white/10 space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              Answer Explanations & Rationales:
                            </h5>
                            {assessmentResult.submission?.questionResults?.map((qr, qidx) => (
                              <div key={qidx} className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1">
                                <div className="font-semibold text-white">Q{qidx + 1}: {qr.text}</div>
                                <div className={qr.isCorrect ? 'text-emerald-400' : 'text-rose-400 font-medium'}>
                                  {qr.isCorrect ? '✓ Correct Answer Selected' : '✗ Incorrect Selection'}
                                </div>
                                <div className="text-slate-300 text-[11px] leading-relaxed pt-1">
                                  <strong>Scientific Explanation:</strong> {qr.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Question Navigator */
                        <div className="space-y-6">
                          {activeAssessment.questions.map((q, idx) => (
                            <div key={q.id} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                              <div className="flex items-start gap-2.5 text-sm font-semibold text-slate-100">
                                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 font-bold">
                                  {idx + 1}
                                </span>
                                <span>{q.text}</span>
                              </div>

                              <div className="grid grid-cols-1 gap-2 pt-2">
                                {q.options.map((opt, optIdx) => (
                                  <label
                                    key={optIdx}
                                    onClick={() => handleSelectOption(q.id, optIdx)}
                                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-colors ${
                                      answers[q.id] === optIdx
                                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-medium'
                                        : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={q.id} 
                                      checked={answers[q.id] === optIdx}
                                      onChange={() => {}}
                                      className="accent-emerald-400"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={handleSubmitAssessment}
                            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-101"
                          >
                            <Send className="w-4 h-4" />
                            <span>Submit Assessment for Grading</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub-Section 3: Course & Content Feedback */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span>Provide Feedback on Content & Training Effectiveness</span>
                  </h3>

                  {feedbackSubmitted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Thank you! Your evaluation has been submitted to the MoES Training Directorate.</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Overall Rating (1-5)
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFeedbackRating(star)}
                                className="p-1 text-amber-500"
                              >
                                <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Content Quality: {feedbackRubric.contentQuality}/5
                          </label>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            value={feedbackRubric.contentQuality}
                            onChange={(e) => setFeedbackRubric({ ...feedbackRubric, contentQuality: Number(e.target.value) })}
                            className="w-full accent-sky-600"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Trainer Effectiveness: {feedbackRubric.trainerEffectiveness}/5
                          </label>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            value={feedbackRubric.trainerEffectiveness}
                            onChange={(e) => setFeedbackRubric({ ...feedbackRubric, trainerEffectiveness: Number(e.target.value) })}
                            className="w-full accent-sky-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Operational Relevance & Suggestions
                        </label>
                        <textarea
                          rows={2}
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="How relevant was this training to your daily forecasting/monitoring operations at IMD?"
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                        />
                      </div>

                      <button
                        onClick={handleSendFeedback}
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Training Review</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
                Select an enrolled program from the left to access learning resources.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: TRAINEE PROFESSIONAL PROFILE & METEOROLOGICAL SKILLS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Bio Card */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="text-center space-y-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-24 h-24 rounded-full mx-auto border-4 border-emerald-100 object-cover shadow-sm"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
                <p className="text-xs font-medium text-emerald-700">{currentUser.designation}</p>
                <p className="text-xs text-slate-500">{currentUser.organization}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{currentUser.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span>Joined: {currentUser.joinedAt}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Research & Training Interests
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(currentUser.profile?.interests || []).map((interest, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Skills & Qualifications */}
          <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Meteorological Technical Skills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Meteorological & Computational Skills
                  </h3>
                  <p className="text-xs text-slate-500">
                    Competencies assessed and tracked by the MoES Competency Directorate.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(currentUser.profile?.skills || []).map((sk, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{sk.name}</span>
                      <span className="text-emerald-600">{sk.level}% Proficiency</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${sk.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Skill Form */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Add skill (e.g. Python for Climate, Radiosonde Ops)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full sm:flex-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <input 
                  type="number"
                  min="10"
                  max="100"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="w-24 p-2.5 text-xs rounded-xl border border-slate-300 text-center font-bold"
                  title="Proficiency percentage"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* MoES Institutional Competency Gap & Recommendation Engine */}
            {skillGap && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>MoES Competency Framework Alignment</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Institutional Skill-Gap Analysis & Recommended Modules
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
                    {skillGap.overallReadiness}% Operational Readiness
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {skillGap.benchmarks?.map((bm) => (
                    <div 
                      key={bm.skillId}
                      className="p-4 rounded-2xl border bg-slate-50 border-slate-200/90 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{bm.skillName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bm.meetsBenchmark 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {bm.meetsBenchmark ? 'Benchmark Met' : `Gap: -${bm.gap}%`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Current: {bm.currentLevel}%</span>
                        <span>Target: {bm.targetLevel}%</span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            bm.meetsBenchmark ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, (bm.currentLevel / bm.targetLevel) * 100)}%` }}
                        />
                      </div>

                      {!bm.meetsBenchmark && (
                        <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-2">
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
                            Rec: {bm.recommendedCourseTitle}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCourse(null);
                              loadCourseDetails(bm.recommendedCourseId);
                              setActiveTab('courses');
                            }}
                            className="text-[11px] font-bold text-sky-600 hover:text-sky-700 shrink-0"
                          >
                            Enroll / View →
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Qualifications & Degrees */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Academic Qualifications
              </h3>

              <div className="space-y-3">
                {(currentUser.profile?.qualifications || []).map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{q.degree}</h4>
                      <p className="text-xs text-slate-500">{q.institute} ({q.year})</p>
                      {q.grade && <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">Score: {q.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Work & Operational Experience
              </h3>

              <div className="space-y-3">
                {(currentUser.profile?.workExperience || []).map((w, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{w.role} • {w.organization}</h4>
                      <span className="text-[11px] font-semibold text-slate-400">{w.period}</span>
                      <p className="text-xs text-slate-600 mt-1">{w.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: CERTIFICATES VAULT */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Verified MoES Digital Credentials</h2>
              <p className="text-xs text-slate-500">
                Official certificates awarded upon passing subject-wise examinations with &gt;= 70% score.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.filter(e => e.certificateId).map((enr) => (
              <div 
                key={enr.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Verified Credential
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {enr.certificateId}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {enr.course?.title || 'Advanced Technical Program'}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2">
                    Conducted by <strong>{enr.course?.institution || 'MoES Training Wing'}</strong>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Awarded: {enr.completedAt || enr.enrolledAt}
                  </div>
                  <button
                    onClick={() => onViewCertificate(enr.certificateId)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Award className="w-4 h-4" />
                    <span>View / Export Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
