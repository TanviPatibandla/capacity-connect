import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Generate ID
const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ==========================================
// 1. AUTHENTICATION & DEMO SWITCHER
// ==========================================

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const data = db.get();
  const user = data.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'User with this email not found' });
  }

  // Check status
  if (user.status === 'pending_approval') {
    return res.status(403).json({ error: 'Account pending Admin approval. Please contact MoES Capacity Directorate.' });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended. Please contact Admin.' });
  }

  // Simplified password check for demo purposes
  if (password && password !== user.password && password !== 'password123') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.json({ success: true, user });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, organization, department, designation, qualifications, skills, bio } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const data = db.get();
  if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUserRole = role === 'trainer' ? 'trainer' : 'trainee';
  // Trainers default to pending_approval for government compliance
  const status = newUserRole === 'trainer' ? 'pending_approval' : 'active';

  const newUser = {
    id: uid('usr'),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: password || 'password123',
    role: newUserRole,
    organization: organization || 'India Meteorological Department (IMD)',
    department: department || 'Meteorological Operations',
    designation: designation || (newUserRole === 'trainer' ? "Scientist 'D'" : 'Scientific Assistant'),
    status,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    joinedAt: new Date().toISOString().split('T')[0],
    profile: {
      qualifications: qualifications ? (Array.isArray(qualifications) ? qualifications : [{ degree: qualifications, institute: 'State University', year: '2024' }]) : [],
      workExperience: [],
      interests: [],
      skills: skills ? (Array.isArray(skills) ? skills : [{ name: skills, level: 80 }]) : [],
      bio: bio || `Dedicated professional in ${organization || 'MoES'}`
    }
  };

  data.users.push(newUser);

  // If trainer, initialize competency profile
  if (newUserRole === 'trainer') {
    data.trainerCompetencies.push({
      trainerId: newUser.id,
      trainerName: newUser.name,
      organization: newUser.organization,
      skills: {},
      experienceYears: 5,
      trainerRating: 4.5,
      certifiedLead: false,
      activeCoursesCount: 0
    });
  }

  db.save();

  res.status(201).json({
    success: true,
    user: newUser,
    message: status === 'pending_approval'
      ? 'Trainer registration submitted! Awaiting Admin verification before login.'
      : 'Account created successfully.'
  });
});

// Demo Quick-Login Switcher
app.post('/api/auth/switch-demo', (req, res) => {
  const { role } = req.body;
  const data = db.get();
  
  let targetUser = null;
  if (role === 'admin') {
    targetUser = data.users.find(u => u.role === 'admin');
  } else if (role === 'trainer') {
    targetUser = data.users.find(u => u.role === 'trainer' && u.status === 'active');
  } else {
    targetUser = data.users.find(u => u.role === 'trainee' && u.status === 'active');
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  res.json({ success: true, user: targetUser });
});

// Update Profile
app.patch('/api/users/:id/profile', (req, res) => {
  const { id } = req.params;
  const { profile, designation, department, organization } = req.body;
  const data = db.get();
  const user = data.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (profile) user.profile = { ...user.profile, ...profile };
  if (designation) user.designation = designation;
  if (department) user.department = department;
  if (organization) user.organization = organization;

  db.save();
  res.json({ success: true, user });
});

// ==========================================
// 2. ADMIN USER APPROVAL & ROLE MANAGEMENT
// ==========================================

// List users
app.get('/api/users', (req, res) => {
  const { role, status } = req.query;
  const data = db.get();
  let list = data.users;

  if (role) list = list.filter(u => u.role === role);
  if (status) list = list.filter(u => u.status === status);

  res.json(list);
});

// Approve, reject, or suspend user
app.patch('/api/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = db.get();
  const user = data.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!['active', 'pending_approval', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  user.status = status;
  db.save();

  res.json({ success: true, user });
});

// Change user role
app.patch('/api/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const data = db.get();
  const user = data.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!['trainee', 'trainer', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  user.role = role;
  db.save();

  res.json({ success: true, user });
});

// ==========================================
// 3. COURSES & ENROLLMENT
// ==========================================

// List all courses
app.get('/api/courses', (req, res) => {
  const { domain, search, trainerId } = req.query;
  const data = db.get();
  let list = data.courses;

  if (domain && domain !== 'All') {
    list = list.filter(c => c.domain.toLowerCase().includes(domain.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  if (trainerId) {
    list = list.filter(c => c.trainerId === trainerId);
  }

  res.json(list);
});

// Course detail
app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const data = db.get();
  const course = data.courses.find(c => c.id === id);

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const materials = data.courseMaterials.filter(m => m.courseId === id);
  const assessments = data.assessments.filter(a => a.courseId === id);
  const feedback = data.feedback.filter(f => f.courseId === id);

  res.json({
    ...course,
    materials,
    assessments,
    feedback
  });
});

// Create course
app.post('/api/courses', (req, res) => {
  const { title, code, domain, institution, level, duration, mode, trainerId, description, syllabus, tags, thumbnail } = req.body;

  if (!title || !domain) {
    return res.status(400).json({ error: 'Title and domain are required' });
  }

  const data = db.get();
  const trainer = data.users.find(u => u.id === trainerId) || { name: 'MoES Faculty' };

  const newCourse = {
    id: uid('crs'),
    code: code || `CC-MOES-${Math.floor(100 + Math.random() * 900)}`,
    title,
    domain,
    institution: institution || 'IMD Training Division',
    level: level || 'Intermediate',
    duration: duration || '30 Hours',
    mode: mode || 'Blended',
    trainerId: trainerId || 'usr-trainer-1',
    trainerName: trainer.name,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
    description: description || 'Comprehensive technical program for earth science capacity building.',
    syllabus: Array.isArray(syllabus) ? syllabus : [
      'Module 1: Foundations & Theoretical Background',
      'Module 2: Practical Data Processing & Tools',
      'Module 3: Operational Case Studies & Decision Support',
      'Module 4: Examination & Final Project'
    ],
    tags: Array.isArray(tags) ? tags : ['MoES', 'Capacity Building'],
    status: 'published',
    featured: false,
    enrolledCount: 0,
    rating: 5.0,
    reviewCount: 0
  };

  data.courses.push(newCourse);
  db.save();

  res.status(201).json(newCourse);
});

// Enroll in course
app.post('/api/enrollments', (req, res) => {
  const { traineeId, courseId } = req.body;
  if (!traineeId || !courseId) {
    return res.status(400).json({ error: 'traineeId and courseId required' });
  }

  const data = db.get();
  const existing = data.enrollments.find(e => e.traineeId === traineeId && e.courseId === courseId);
  if (existing) {
    return res.json({ success: true, enrollment: existing, message: 'Already enrolled' });
  }

  const newEnrollment = {
    id: uid('enr'),
    traineeId,
    courseId,
    progress: 10,
    completedModules: ['Module 1'],
    enrolledAt: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    certificateId: null
  };

  data.enrollments.push(newEnrollment);

  // Increment course enrolledCount
  const course = data.courses.find(c => c.id === courseId);
  if (course) course.enrolledCount = (course.enrolledCount || 0) + 1;

  db.save();
  res.status(201).json({ success: true, enrollment: newEnrollment });
});

// Get user enrollments
app.get('/api/enrollments', (req, res) => {
  const { traineeId } = req.query;
  const data = db.get();
  let list = data.enrollments;

  if (traineeId) {
    list = list.filter(e => e.traineeId === traineeId);
  }

  // Populate course details
  const populated = list.map(enr => {
    const course = data.courses.find(c => c.id === enr.courseId);
    return {
      ...enr,
      course
    };
  });

  res.json(populated);
});

// Update progress
app.patch('/api/enrollments/:id/progress', (req, res) => {
  const { id } = req.params;
  const { progress, moduleCompleted } = req.body;
  const data = db.get();
  const enr = data.enrollments.find(e => e.id === id);

  if (!enr) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  if (typeof progress === 'number') {
    enr.progress = Math.min(100, Math.max(0, progress));
  }
  if (moduleCompleted && !enr.completedModules.includes(moduleCompleted)) {
    enr.completedModules.push(moduleCompleted);
  }

  if (enr.progress >= 100 && enr.status !== 'completed') {
    enr.status = 'completed';
    enr.completedAt = new Date().toISOString().split('T')[0];
    if (!enr.certificateId) {
      enr.certificateId = `MOES-CC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }
  }

  db.save();
  res.json({ success: true, enrollment: enr });
});

// Step Progression Engine: Prerequisite Check & Unlocking
app.post('/api/enrollments/:id/step', (req, res) => {
  const { id } = req.params;
  const { stepKey } = req.body;
  const data = db.get();
  const enr = data.enrollments.find(e => e.id === id);
  if (!enr) return res.status(404).json({ error: 'Enrollment not found' });

  if (!enr.completedSteps) enr.completedSteps = ['lecture_video'];
  if (stepKey && !enr.completedSteps.includes(stepKey)) {
    enr.completedSteps.push(stepKey);
  }

  const milestones = ['lecture_video', 'notes_sop', 'practical_sim', 'assessment'];
  const count = milestones.filter(s => enr.completedSteps.includes(s)).length;
  enr.progress = Math.min(100, Math.max(enr.progress || 0, Math.round((count / milestones.length) * 100)));

  // Exam unlocked once lecture and practical simulation are verified
  const examUnlocked = enr.completedSteps.includes('lecture_video') && enr.completedSteps.includes('practical_sim');

  db.save();
  res.json({ success: true, enrollment: enr, examUnlocked, completedSteps: enr.completedSteps });
});


// ==========================================
// 4. LEARNING MATERIALS & TRAINER LIBRARY
// ==========================================

// Get materials
app.get('/api/materials', (req, res) => {
  const { courseId, trainerName } = req.query;
  const data = db.get();
  let list = data.courseMaterials;

  if (courseId) list = list.filter(m => m.courseId === courseId);
  if (trainerName) list = list.filter(m => m.uploadedBy === trainerName);

  res.json(list);
});

// Upload/create material
app.post('/api/materials', (req, res) => {
  const { courseId, type, title, duration, fileUrl, description, uploadedBy, size } = req.body;

  if (!courseId || !title || !type) {
    return res.status(400).json({ error: 'courseId, title, and type are required' });
  }

  const data = db.get();
  const newMaterial = {
    id: uid('mat'),
    courseId,
    type,
    title,
    duration: duration || (type === 'video' ? '30 mins' : null),
    fileUrl: fileUrl || (type === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : '#'),
    description: description || 'Digital capacity building training resource.',
    uploadedBy: uploadedBy || 'Trainer',
    uploadedAt: new Date().toISOString().split('T')[0],
    size: size || '15 MB'
  };

  data.courseMaterials.push(newMaterial);
  db.save();

  res.status(201).json(newMaterial);
});

// Delete material
app.delete('/api/materials/:id', (req, res) => {
  const { id } = req.params;
  const data = db.get();
  data.courseMaterials = data.courseMaterials.filter(m => m.id !== id);
  db.save();
  res.json({ success: true });
});

// ==========================================
// 5. ASSESSMENTS & SUBMISSIONS
// ==========================================

// List assessments
app.get('/api/assessments', (req, res) => {
  const { courseId, createdBy } = req.query;
  const data = db.get();
  let list = data.assessments;

  if (courseId) list = list.filter(a => a.courseId === courseId);
  if (createdBy) list = list.filter(a => a.createdBy === createdBy);

  res.json(list);
});

// Get single assessment
app.get('/api/assessments/:id', (req, res) => {
  const { id } = req.params;
  const data = db.get();
  const asm = data.assessments.find(a => a.id === id);

  if (!asm) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  const course = data.courses.find(c => c.id === asm.courseId);
  res.json({ ...asm, course });
});

// Create assessment (Trainer / Admin)
app.post('/api/assessments', (req, res) => {
  const { courseId, subject, title, durationMins, passPercentage, deadline, createdBy, questions, totalMarks } = req.body;

  if (!courseId || !title || !questions || !questions.length) {
    return res.status(400).json({ error: 'courseId, title, and at least 1 question are required' });
  }

  const data = db.get();
  const newAsm = {
    id: uid('asm'),
    courseId,
    subject: subject || 'Competency Evaluation',
    title,
    durationMins: Number(durationMins) || 15,
    passPercentage: Number(passPercentage) || 70,
    deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
    createdBy: createdBy || 'usr-trainer-1',
    totalMarks: totalMarks || questions.length * 10,
    questions: questions.map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      text: q.text,
      options: q.options,
      correctIndex: Number(q.correctIndex) || 0,
      explanation: q.explanation || 'Refer to the course materials for detailed derivation.'
    }))
  };

  data.assessments.push(newAsm);
  db.save();

  res.status(201).json(newAsm);
});

// Submit assessment
app.post('/api/assessments/:id/submit', (req, res) => {
  const { id } = req.params;
  const { traineeId, answers } = req.body; // answers: { q1: 1, q2: 2, ... }

  const data = db.get();
  const asm = data.assessments.find(a => a.id === id);
  if (!asm) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  const trainee = data.users.find(u => u.id === traineeId) || { name: 'Trainee' };

  // Calculate score
  let correctCount = 0;
  const questionResults = asm.questions.map(q => {
    const selected = answers[q.id];
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      text: q.text,
      selected,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    };
  });

  const percentage = Math.round((correctCount / asm.questions.length) * 100);
  const passed = percentage >= asm.passPercentage;
  const score = Math.round((correctCount / asm.questions.length) * (asm.totalMarks || 50));

  const submission = {
    id: uid('sub'),
    assessmentId: id,
    courseId: asm.courseId,
    traineeId,
    traineeName: trainee.name,
    score,
    totalMarks: asm.totalMarks || 50,
    percentage,
    passed,
    submittedAt: new Date().toISOString(),
    answers,
    questionResults
  };

  data.submissions.push(submission);

  // If passed, update course enrollment progress and issue certificate if 100%
  const enrollment = data.enrollments.find(e => e.traineeId === traineeId && e.courseId === asm.courseId);
  if (enrollment && passed) {
    enrollment.progress = 100;
    enrollment.status = 'completed';
    enrollment.completedAt = new Date().toISOString().split('T')[0];
    if (!enrollment.certificateId) {
      enrollment.certificateId = `MOES-CC-${new Date().getFullYear()}-${asm.courseId.replace('crs-', '').toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    }
  }

  db.save();

  res.json({
    success: true,
    submission,
    passed,
    score,
    totalMarks: asm.totalMarks || 50,
    percentage,
    passPercentage: asm.passPercentage,
    certificateId: enrollment?.certificateId || null
  });
});

// Get submissions / gradebook
app.get('/api/submissions', (req, res) => {
  const { assessmentId, traineeId, courseId } = req.query;
  const data = db.get();
  let list = data.submissions;

  if (assessmentId) list = list.filter(s => s.assessmentId === assessmentId);
  if (traineeId) list = list.filter(s => s.traineeId === traineeId);
  if (courseId) list = list.filter(s => s.courseId === courseId);

  // Attach assessment title
  const enriched = list.map(sub => {
    const asm = data.assessments.find(a => a.id === sub.assessmentId);
    return {
      ...sub,
      assessmentTitle: asm ? asm.title : 'Assessment',
      subject: asm ? asm.subject : 'Subject'
    };
  });

  res.json(enriched);
});

// Export Gradebook to CSV
app.get('/api/gradebook/export', (req, res) => {
  const data = db.get();
  const rows = [
    ['Trainee Name', 'Email', 'Organization', 'Department', 'Course Code', 'Assessment Title', 'Score', 'Total Marks', 'Percentage', 'Status', 'Date']
  ];

  data.submissions.forEach(sub => {
    const user = data.users.find(u => u.id === sub.traineeId);
    const course = data.courses.find(c => c.id === sub.courseId);
    const asm = data.assessments.find(a => a.id === sub.assessmentId);
    rows.push([
      `"${sub.traineeName || user?.name || 'Trainee'}"`,
      `"${user?.email || ''}"`,
      `"${user?.organization || 'MoES'}"`,
      `"${user?.department || ''}"`,
      `"${course?.code || ''}"`,
      `"${asm?.title || 'Certification Assessment'}"`,
      sub.score,
      sub.totalMarks,
      `"${sub.percentage}%"`,
      `"${sub.passed ? 'PASSED' : 'RETAKE NEEDED'}"`,
      `"${new Date(sub.submittedAt).toLocaleDateString()}"`
    ]);
  });

  const csv = rows.map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="MoES_Capacity_Gradebook.csv"');
  res.send(csv);
});


// ==========================================
// 6. CERTIFICATE VERIFICATION
// ==========================================

app.get('/api/certificates/:certId', (req, res) => {
  const { certId } = req.params;
  const data = db.get();
  const enrollment = data.enrollments.find(e => e.certificateId === certId);

  if (!enrollment) {
    return res.status(404).json({ error: 'Certificate not found or invalid ID' });
  }

  const trainee = data.users.find(u => u.id === enrollment.traineeId);
  const course = data.courses.find(c => c.id === enrollment.courseId);
  const trainer = course ? data.users.find(u => u.id === course.trainerId) : null;

  res.json({
    certificateId: certId,
    issueDate: enrollment.completedAt || enrollment.enrolledAt,
    traineeName: trainee ? trainee.name : 'Participant',
    organization: trainee ? trainee.organization : 'MoES',
    courseTitle: course ? course.title : 'Advanced Technical Program',
    courseCode: course ? course.code : 'CC-MOES',
    duration: course ? course.duration : '40 Hours',
    trainerName: trainer ? trainer.name : (course ? course.trainerName : 'Course Director'),
    verificationHash: `SHA256-${Buffer.from(certId).toString('hex').slice(0, 16)}`,
    issuingAuthority: 'Ministry of Earth Sciences & India Meteorological Department'
  });
});

// ==========================================
// 7. COURSE FEEDBACK
// ==========================================

app.get('/api/feedback', (req, res) => {
  const { courseId } = req.query;
  const data = db.get();
  let list = data.feedback;
  if (courseId) list = list.filter(f => f.courseId === courseId);
  res.json(list);
});

app.post('/api/feedback', (req, res) => {
  const { courseId, traineeId, rating, rubric, comment } = req.body;
  if (!courseId || !rating) {
    return res.status(400).json({ error: 'courseId and rating are required' });
  }

  const data = db.get();
  const trainee = data.users.find(u => u.id === traineeId) || { name: 'Anonymous Trainee' };

  const newFeedback = {
    id: uid('fb'),
    courseId,
    traineeId: traineeId || 'anon',
    traineeName: trainee.name,
    rating: Number(rating),
    rubric: rubric || { contentQuality: rating, trainerEffectiveness: rating, practicalRelevance: rating },
    comment: comment || 'Very helpful training session.',
    submittedAt: new Date().toISOString().split('T')[0]
  };

  data.feedback.push(newFeedback);

  // Update course rating average
  const courseFeedbacks = data.feedback.filter(f => f.courseId === courseId);
  const avgRating = courseFeedbacks.reduce((sum, f) => sum + f.rating, 0) / courseFeedbacks.length;
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    course.rating = Number(avgRating.toFixed(1));
    course.reviewCount = courseFeedbacks.length;
  }

  db.save();
  res.status(201).json(newFeedback);
});

// Feedback Analytics & Pedagogical Quality Assessment
app.get('/api/feedback/analytics', (req, res) => {
  const { trainerId, courseId } = req.query;
  const data = db.get();
  
  let targetCourses = data.courses;
  if (trainerId) {
    targetCourses = targetCourses.filter(c => c.trainerId === trainerId);
  }
  if (courseId) {
    targetCourses = targetCourses.filter(c => c.id === courseId);
  }
  
  const courseIds = new Set(targetCourses.map(c => c.id));
  const feedbacks = data.feedback.filter(f => courseIds.has(f.courseId));
  
  const totalReviews = feedbacks.length;
  if (totalReviews === 0) {
    return res.json({
      totalReviews: 0,
      averageRating: 5.0,
      metrics: {
        contentQuality: 5.0,
        trainerEffectiveness: 5.0,
        practicalRelevance: 5.0
      },
      npsScore: 92,
      recommendationRate: 98,
      feedbacks: []
    });
  }
  
  const sumRating = feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
  const sumContent = feedbacks.reduce((acc, f) => acc + (f.rubric?.contentQuality || f.rating || 5), 0);
  const sumTrainer = feedbacks.reduce((acc, f) => acc + (f.rubric?.trainerEffectiveness || f.rating || 5), 0);
  const sumPractical = feedbacks.reduce((acc, f) => acc + (f.rubric?.practicalRelevance || f.rating || 5), 0);
  
  const promoters = feedbacks.filter(f => f.rating >= 4.5).length;
  const detractors = feedbacks.filter(f => f.rating <= 3).length;
  const nps = Math.round(((promoters - detractors) / totalReviews) * 100);
  
  res.json({
    totalReviews,
    averageRating: Number((sumRating / totalReviews).toFixed(1)),
    metrics: {
      contentQuality: Number((sumContent / totalReviews).toFixed(1)),
      trainerEffectiveness: Number((sumTrainer / totalReviews).toFixed(1)),
      practicalRelevance: Number((sumPractical / totalReviews).toFixed(1))
    },
    npsScore: Math.max(nps, 85),
    recommendationRate: Math.round((promoters / totalReviews) * 100),
    feedbacks: feedbacks.map(f => {
      const c = data.courses.find(x => x.id === f.courseId);
      return {
        ...f,
        courseTitle: c ? c.title : 'MoES Scientific Course'
      };
    })
  });
});

// ==========================================
// 8. ANNOUNCEMENTS & BROADCASTS
// ==========================================

app.get('/api/announcements', (req, res) => {
  const data = db.get();
  res.json(data.announcements || []);
});

app.post('/api/announcements', (req, res) => {
  const { title, category, priority, targetAudience, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const data = db.get();
  const newAnc = {
    id: uid('anc'),
    title,
    category: category || 'announcement', // notification, announcement, achievement, new_content
    priority: priority || 'normal', // high, medium, normal
    targetAudience: targetAudience || 'all',
    content,
    author: author || 'MoES Administration',
    publishedAt: new Date().toISOString().split('T')[0]
  };

  data.announcements.unshift(newAnc);
  db.save();

  res.status(201).json(newAnc);
});

app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const data = db.get();
  data.announcements = data.announcements.filter(a => a.id !== id);
  db.save();
  res.json({ success: true });
});

// ==========================================
// 9. COMPETENCY MAPPING ENGINE
// ==========================================

// Get skill taxonomy
app.get('/api/competency/taxonomy', (req, res) => {
  const data = db.get();
  res.json(data.competencyTaxonomy || []);
});

// Get trainer competency matrix
app.get('/api/competency/matrix', (req, res) => {
  const data = db.get();
  res.json(data.trainerCompetencies || []);
});

// Intelligent Trainer Matching Algorithm
app.post('/api/competency/match-trainer', (req, res) => {
  const { requiredSkills, minExperience, domain } = req.body;
  // requiredSkills: [{ skillId: 'sk-rad', weight: 1.0 }, ...]

  const data = db.get();
  const candidates = data.trainerCompetencies.map(tc => {
    const user = data.users.find(u => u.id === tc.trainerId);
    let skillScore = 0;
    let totalWeight = 0;

    if (requiredSkills && requiredSkills.length > 0) {
      requiredSkills.forEach(reqSkill => {
        const weight = reqSkill.weight || 1.0;
        totalWeight += weight;
        const prof = tc.skills[reqSkill.skillId] || 20; // default baseline
        skillScore += prof * weight;
      });
    } else {
      // General average of all skills
      const vals = Object.values(tc.skills);
      skillScore = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 50;
      totalWeight = 1;
    }

    const normalizedSkill = totalWeight > 0 ? skillScore / totalWeight : 50;
    
    // Experience factor (up to 20 years = 100%)
    const expFactor = Math.min(100, (tc.experienceYears / 20) * 100);
    // Rating factor (5.0 = 100%)
    const ratingFactor = (tc.trainerRating / 5.0) * 100;

    // Composite Match Index: 50% skill match + 25% experience + 25% participant rating
    const matchScore = Math.round(normalizedSkill * 0.5 + expFactor * 0.25 + ratingFactor * 0.25);

    return {
      trainerId: tc.trainerId,
      trainerName: tc.trainerName,
      organization: tc.organization,
      designation: user?.designation || "Scientist",
      avatar: user?.avatar,
      matchScore: Math.min(100, matchScore),
      experienceYears: tc.experienceYears,
      trainerRating: tc.trainerRating,
      certifiedLead: tc.certifiedLead,
      skills: tc.skills,
      bio: user?.profile?.bio || 'Senior Scientific Faculty'
    };
  });

  // Sort descending by matchScore
  candidates.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    query: { requiredSkills, minExperience, domain },
    recommendedTrainers: candidates
  });
});

// Update trainer competency skills
app.patch('/api/competency/trainer/:trainerId', (req, res) => {
  const { trainerId } = req.params;
  const { skills, experienceYears, certifiedLead } = req.body;
  const data = db.get();
  const tc = data.trainerCompetencies.find(t => t.trainerId === trainerId);

  if (!tc) {
    return res.status(404).json({ error: 'Trainer competency profile not found' });
  }

  if (skills) tc.skills = { ...tc.skills, ...skills };
  if (typeof experienceYears === 'number') tc.experienceYears = experienceYears;
  if (typeof certifiedLead === 'boolean') tc.certifiedLead = certifiedLead;

  db.save();
  res.json({ success: true, competency: tc });
});

// Trainee Institutional Skill-Gap Analysis Engine
app.get('/api/competency/skill-gap/:traineeId', (req, res) => {
  const { traineeId } = req.params;
  const data = db.get();
  const user = data.users.find(u => u.id === traineeId);
  if (!user) return res.status(404).json({ error: 'Trainee not found' });

  // Standard MoES Operational Competency Target Benchmarks
  const benchmarks = [
    { skillId: 'sk-rad', name: 'Doppler Radar Interpretation & Dual-Pol', target: 85, domain: 'Radar Meteorology', courseId: 'crs-101', courseTitle: 'Advanced Doppler Weather Radar (DWR) Calibration' },
    { skillId: 'sk-nwp', name: 'WRF Model & High-Resolution NWP', target: 80, domain: 'Atmospheric Modeling', courseId: 'crs-202', courseTitle: 'Numerical Weather Prediction (NWP) Modeling' },
    { skillId: 'sk-sat', name: 'Satellite Imagery & Cyclone Dvorak', target: 75, domain: 'Satellite Meteorology', courseId: 'crs-303', courseTitle: 'INSAT-3D/3DR Satellite Data Processing' },
    { skillId: 'sk-ocn', name: 'Ocean Tsunami & Storm Surge Modeling', target: 70, domain: 'Ocean Science & Hazards', courseId: 'crs-501', courseTitle: 'Ocean Observation Systems & Tsunami Early Warning' }
  ];

  const userSkills = user.profile?.skills || [];
  const analysis = benchmarks.map(bm => {
    const found = userSkills.find(s => 
      s.name.toLowerCase().includes('radar') && bm.skillId === 'sk-rad' ||
      s.name.toLowerCase().includes('wrf') && bm.skillId === 'sk-nwp' ||
      s.name.toLowerCase().includes('satellite') && bm.skillId === 'sk-sat' ||
      s.name.toLowerCase().includes('ocean') && bm.skillId === 'sk-ocn' ||
      s.name.toLowerCase().includes(bm.name.toLowerCase().split(' ')[0])
    );
    const current = found ? found.level : 45; // baseline assessment
    const gap = Math.max(0, bm.target - current);
    const meetsBenchmark = current >= bm.target;

    return {
      skillId: bm.skillId,
      skillName: bm.name,
      domain: bm.domain,
      currentLevel: current,
      targetLevel: bm.target,
      gap,
      meetsBenchmark,
      recommendedCourseId: bm.courseId,
      recommendedCourseTitle: bm.courseTitle
    };
  });

  const overallReadiness = Math.round(
    analysis.reduce((sum, a) => sum + (Math.min(a.targetLevel, a.currentLevel) / a.targetLevel) * 100, 0) / analysis.length
  );

  res.json({
    traineeId,
    traineeName: user.name,
    organization: user.organization,
    department: user.department,
    overallReadiness: Math.min(100, overallReadiness),
    benchmarks: analysis
  });
});


// ==========================================
// 10. ADMIN DASHBOARD METRICS
// ==========================================

app.get('/api/admin/stats', (req, res) => {
  const data = db.get();
  
  const traineesCount = data.users.filter(u => u.role === 'trainee').length;
  const trainersCount = data.users.filter(u => u.role === 'trainer' && u.status === 'active').length;
  const pendingApprovalsCount = data.users.filter(u => u.status === 'pending_approval').length;
  const coursesCount = data.courses.length;
  const enrollmentsCount = data.enrollments.length;
  const certificatesCount = data.enrollments.filter(e => e.certificateId).length;

  // Pass rate
  const submissionsCount = data.submissions.length;
  const passedCount = data.submissions.filter(s => s.passed).length;
  const passRate = submissionsCount > 0 ? Math.round((passedCount / submissionsCount) * 100) : 0;

  // Institutional breakdown
  const departmentBreakdown = [
    { name: 'IMD (Meteorological Dept)', count: 184, share: 45 },
    { name: 'IITM (Tropical Meteorology)', count: 72, share: 18 },
    { name: 'INCOIS (Ocean Services)', count: 58, share: 14 },
    { name: 'NCMRWF (Weather Forecasting)', count: 48, share: 12 },
    { name: 'NIOT (Ocean Technology)', count: 44, share: 11 }
  ];

  // Domain distribution
  const domainBreakdown = [
    { domain: 'Radar Meteorology', courses: 2, enrolled: 180 },
    { domain: 'NWP & Modeling', courses: 1, enrolled: 98 },
    { domain: 'Satellite Meteorology', courses: 1, enrolled: 165 },
    { domain: 'Ocean & Tsunami Hazards', courses: 1, enrolled: 84 },
    { domain: 'Seismology & Geophysics', courses: 1, enrolled: 72 }
  ];

  res.json({
    metrics: {
      traineesCount,
      trainersCount,
      pendingApprovalsCount,
      coursesCount,
      enrollmentsCount,
      certificatesCount,
      submissionsCount,
      passRate
    },
    departmentBreakdown,
    domainBreakdown
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Capacity Connect API Server running on port ${PORT}`);
});
