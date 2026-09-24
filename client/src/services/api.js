// API Client for Capacity Connect
const API_BASE = '/api';

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  switchDemoRole: async (role) => {
    const res = await fetch(`${API_BASE}/auth/switch-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  updateProfile: async (userId, data) => {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Users & Admin
  getUsers: async (role, status) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/users?${params.toString()}`);
    return res.json();
  },

  updateUserStatus: async (userId, status) => {
    const res = await fetch(`${API_BASE}/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  updateUserRole: async (userId, role) => {
    const res = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  // Courses
  getCourses: async (domain, search, trainerId) => {
    const params = new URLSearchParams();
    if (domain) params.append('domain', domain);
    if (search) params.append('search', search);
    if (trainerId) params.append('trainerId', trainerId);
    const res = await fetch(`${API_BASE}/courses?${params.toString()}`);
    return res.json();
  },

  getCourse: async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}`);
    return res.json();
  },

  createCourse: async (courseData) => {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    return res.json();
  },

  // Enrollments
  getEnrollments: async (traineeId) => {
    const res = await fetch(`${API_BASE}/enrollments?traineeId=${traineeId || ''}`);
    return res.json();
  },

  enrollCourse: async (traineeId, courseId) => {
    const res = await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traineeId, courseId })
    });
    return res.json();
  },

  updateProgress: async (enrollmentId, progress, moduleCompleted) => {
    const res = await fetch(`${API_BASE}/enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, moduleCompleted })
    });
    return res.json();
  },

  completeEnrollmentStep: async (enrollmentId, stepKey) => {
    const res = await fetch(`${API_BASE}/enrollments/${enrollmentId}/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepKey })
    });
    return res.json();
  },

  getTraineeSkillGap: async (traineeId) => {
    const res = await fetch(`${API_BASE}/competency/skill-gap/${traineeId}`);
    return res.json();
  },

  getGradebookExportUrl: () => `${API_BASE}/gradebook/export`,


  // Learning Materials
  getMaterials: async (courseId, trainerName) => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (trainerName) params.append('trainerName', trainerName);
    const res = await fetch(`${API_BASE}/materials?${params.toString()}`);
    return res.json();
  },

  createMaterial: async (materialData) => {
    const res = await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData)
    });
    return res.json();
  },

  deleteMaterial: async (id) => {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Assessments
  getAssessments: async (courseId, createdBy) => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (createdBy) params.append('createdBy', createdBy);
    const res = await fetch(`${API_BASE}/assessments?${params.toString()}`);
    return res.json();
  },

  getAssessment: async (id) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`);
    return res.json();
  },

  createAssessment: async (assessmentData) => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    return res.json();
  },

  submitAssessment: async (assessmentId, traineeId, answers) => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ traineeId, answers })
    });
    return res.json();
  },

  getSubmissions: async (assessmentId, traineeId, courseId) => {
    const params = new URLSearchParams();
    if (assessmentId) params.append('assessmentId', assessmentId);
    if (traineeId) params.append('traineeId', traineeId);
    if (courseId) params.append('courseId', courseId);
    const res = await fetch(`${API_BASE}/submissions?${params.toString()}`);
    return res.json();
  },

  // Certificate
  getCertificate: async (certId) => {
    const res = await fetch(`${API_BASE}/certificates/${certId}`);
    return res.json();
  },

  // Feedback
  getFeedback: async (courseId) => {
    const res = await fetch(`${API_BASE}/feedback?courseId=${courseId || ''}`);
    return res.json();
  },

  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },

  // Announcements
  getAnnouncements: async () => {
    const res = await fetch(`${API_BASE}/announcements`);
    return res.json();
  },

  createAnnouncement: async (data) => {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteAnnouncement: async (id) => {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Competency Mapping
  getCompetencyTaxonomy: async () => {
    const res = await fetch(`${API_BASE}/competency/taxonomy`);
    return res.json();
  },

  getCompetencyMatrix: async () => {
    const res = await fetch(`${API_BASE}/competency/matrix`);
    return res.json();
  },

  matchTrainers: async (criteria) => {
    const res = await fetch(`${API_BASE}/competency/match-trainer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    });
    return res.json();
  },

  // Admin Stats
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return res.json();
  }
};
