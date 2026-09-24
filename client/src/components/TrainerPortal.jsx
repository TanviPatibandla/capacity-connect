import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  HelpCircle, 
  Upload, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileText, 
  Trash2, 
  Video, 
  BarChart2, 
  Send,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

export default function TrainerPortal({ currentUser, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('assessments'); // assessments, gradebook, library, profile
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Assessment Form State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newAsmSubject, setNewAsmSubject] = useState('');
  const [newAsmTitle, setNewAsmTitle] = useState('');
  const [newAsmDuration, setNewAsmDuration] = useState(15);
  const [newAsmPassRate, setNewAsmPassRate] = useState(70);
  const [newAsmDeadline, setNewAsmDeadline] = useState('2026-11-30');
  const [questions, setQuestions] = useState([
    {
      id: 'q_1',
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    }
  ]);
  const [asmSuccessMsg, setAsmSuccessMsg] = useState('');

  // New Resource Upload State
  const [uploadCourseId, setUploadCourseId] = useState('');
  const [uploadType, setUploadType] = useState('presentation'); // video, presentation, document, dataset
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadDuration, setUploadDuration] = useState('45 mins');
  const [uploadSize, setUploadSize] = useState('12.5 MB');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  useEffect(() => {
    loadTrainerData();
  }, [currentUser]);

  const loadTrainerData = async () => {
    try {
      setLoading(true);
      const crs = await api.getCourses(null, null, currentUser.id);
      setCourses(crs);
      if (crs.length > 0) {
        setSelectedCourseId(crs[0].id);
        setUploadCourseId(crs[0].id);
      }

      const subs = await api.getSubmissions();
      setSubmissions(subs);

      const mats = await api.getMaterials(null, currentUser.name);
      setMaterials(mats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q_${prev.length + 1}`,
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }
    ]);
  };

  const handleUpdateQuestion = (qIndex, field, value) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIndex][field] = value;
      return copy;
    });
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIndex].options[optIndex] = value;
      return copy;
    });
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !newAsmTitle || !questions[0].text) {
      alert('Please fill out the assessment title and at least one valid question.');
      return;
    }

    try {
      await api.createAssessment({
        courseId: selectedCourseId,
        subject: newAsmSubject || 'Technical Assessment',
        title: newAsmTitle,
        durationMins: Number(newAsmDuration),
        passPercentage: Number(newAsmPassRate),
        deadline: new Date(newAsmDeadline).toISOString(),
        createdBy: currentUser.id,
        questions
      });

      setAsmSuccessMsg('Questionnaire and Assessment successfully created and published for trainees!');
      setNewAsmTitle('');
      setNewAsmSubject('');
      setQuestions([
        {
          id: 'q_1',
          text: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
        }
      ]);
      setTimeout(() => setAsmSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to create assessment.');
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!uploadCourseId || !uploadTitle) {
      alert('Please select a course and specify a title.');
      return;
    }

    try {
      await api.createMaterial({
        courseId: uploadCourseId,
        type: uploadType,
        title: uploadTitle,
        description: uploadDesc,
        duration: uploadType === 'video' ? uploadDuration : null,
        size: uploadSize,
        uploadedBy: currentUser.name,
        fileUrl: uploadType === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : '#'
      });

      setUploadSuccessMsg('Resource uploaded and synced to trainee course room!');
      setUploadTitle('');
      setUploadDesc('');
      const mats = await api.getMaterials(null, currentUser.name);
      setMaterials(mats);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this resource from the library?')) return;
    try {
      await api.deleteMaterial(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-16 h-16 rounded-2xl border-2 border-indigo-400 object-cover shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>MoES Senior Faculty & Trainer Studio</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
              <p className="text-xs text-slate-300">
                {currentUser.designation} • {currentUser.organization} ({currentUser.department})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-xl font-bold text-indigo-300">{courses.length}</div>
              <div className="text-[11px] text-slate-300">Authored Courses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-xl font-bold text-emerald-400">{submissions.length}</div>
              <div className="text-[11px] text-slate-300">Graded Attempts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-xl font-bold text-amber-400">{materials.length}</div>
              <div className="text-[11px] text-slate-300">Uploaded Resources</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'assessments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Assessment & Questionnaire Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('gradebook')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'gradebook'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Trainee Gradebook & Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'library'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Trainer Digital Library</span>
        </button>
      </div>

      {/* TAB 1: ASSESSMENT & QUESTIONNAIRE STUDIO */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create Subject-wise MCQ Questionnaire</h2>
              <p className="text-xs text-slate-500">
                Design custom assessments with deadlines, time limits, answer keys, and scientific explanations.
              </p>
            </div>
            {asmSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{asmSuccessMsg}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleCreateAssessment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Subject / Domain</label>
                <input 
                  type="text"
                  placeholder="e.g. Dual-Pol Calibration & Radar Equations"
                  value={newAsmSubject}
                  onChange={(e) => setNewAsmSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Submission Deadline</label>
                <input 
                  type="date"
                  value={newAsmDeadline}
                  onChange={(e) => setNewAsmDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Assessment Title</label>
                <input 
                  type="text"
                  placeholder="e.g. End-Term Comprehensive MCQ on Mesoscale Weather Systems"
                  value={newAsmTitle}
                  onChange={(e) => setNewAsmTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (Mins)</label>
                  <input 
                    type="number"
                    min="5"
                    max="180"
                    value={newAsmDuration}
                    onChange={(e) => setNewAsmDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Pass %</label>
                  <input 
                    type="number"
                    min="40"
                    max="100"
                    value={newAsmPassRate}
                    onChange={(e) => setNewAsmPassRate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Assessment Question Bank ({questions.length} Questions)
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Question</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Question {qIndex + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuestions(prev => prev.filter((_, idx) => idx !== qIndex))}
                          className="text-xs text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <input 
                        type="text"
                        placeholder="Enter the question statement..."
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(qIndex, 'text', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                      />
                    </div>

                    {/* 4 Options with radio for correct answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <input 
                            type="radio" 
                            name={`correct_${qIndex}`}
                            checked={q.correctIndex === optIndex}
                            onChange={() => handleUpdateQuestion(qIndex, 'correctIndex', optIndex)}
                            className="accent-indigo-600 shrink-0"
                            title="Mark as correct answer"
                          />
                          <input 
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                            className="w-full text-xs border-0 focus:ring-0 p-0 text-slate-800"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <input 
                        type="text"
                        placeholder="Scientific explanation for the correct answer (shown to trainee after grading)..."
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuestion(qIndex, 'explanation', e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white/70 text-slate-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Publish Assessment Questionnaire</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TRAINEE GRADEBOOK & PERFORMANCE MONITOR */}
      {activeTab === 'gradebook' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Trainee Performance Gradebook</h2>
              <p className="text-xs text-slate-500">
                Track attempts, scores, and pass percentages across enrolled meteorological officers.
              </p>
            </div>
            <button
              onClick={() => alert('Exporting gradebook report as CSV / Excel format...')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-300"
            >
              Export Gradebook (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sub.traineeName}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {sub.assessmentTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {sub.subject}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {sub.score} / {sub.totalMarks}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold">{sub.percentage}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.passed ? 'PASSED' : 'RETAKE NEEDED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRAINER DIGITAL LIBRARY (UPLOAD & MANAGE) */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Upload Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Upload Learning Material</span>
            </h3>

            {uploadSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Course</label>
                <select
                  value={uploadCourseId}
                  onChange={(e) => setUploadCourseId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Resource Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                  >
                    <option value="video">Recorded Lecture (Video)</option>
                    <option value="presentation">Presentation (PDF / PPT)</option>
                    <option value="document">Technical Manual / SOP</option>
                    <option value="dataset">Scientific NetCDF Dataset</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Size / Length</label>
                  <input 
                    type="text"
                    value={uploadType === 'video' ? uploadDuration : uploadSize}
                    onChange={(e) => uploadType === 'video' ? setUploadDuration(e.target.value) : setUploadSize(e.target.value)}
                    placeholder="e.g. 45 mins or 15 MB"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Lecture 4: Severe Thunderstorm Dynamics"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Summary of lecture concepts or dataset usage notes..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Upload & Publish to Trainee Library
              </button>
            </form>
          </div>

          {/* Uploaded Materials List */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>My Published Study Materials</span>
              <span className="text-xs text-slate-400 font-normal">{materials.length} Files</span>
            </h3>

            <div className="space-y-3">
              {materials.map((m) => (
                <div 
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white rounded-xl text-indigo-600 border border-slate-200 shadow-2xs">
                      {m.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                      <p className="text-[11px] text-slate-500">{m.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{m.uploadedAt}</span>
                        <span>•</span>
                        <span>{m.size || m.duration}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
