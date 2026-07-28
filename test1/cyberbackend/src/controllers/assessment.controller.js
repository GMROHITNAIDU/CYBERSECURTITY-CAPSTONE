import { Assessment, UserAssessment, Module } from '../models/associations.js';

// ---------- helpers ----------
function safeParseJSON(raw, fallback) {
  if (raw == null) return fallback;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return fallback; }
  }
  if (Array.isArray(raw) || typeof raw === 'object') return raw;
  return fallback;
}

function toAssessmentDTO(aRow) {
  const q = safeParseJSON(aRow.questions, []);
  return {
    id: aRow.id,
    module_id: aRow.moduleId,
    title: aRow.title,
    is_timed: Boolean(aRow.isTimed),
    duration_sec: aRow.durationSec ?? null,
    questions: Array.isArray(q) ? q : [],
  };
}

function computeScore(answers, questions) {
  const arr = Array.isArray(questions) ? questions : [];
  if (arr.length === 0) return 0;
  let correct = 0;
  for (const q of arr) {
    const user = answers[q.id];
    if (q.type === 'multiple_choice') {
      if (user != null && user === q.correct_answer) correct += 1;
    } else if (q.type === 'true_false') {
      // store true/false as booleans in questions; compare strictly
      if (typeof user === 'boolean' && user === Boolean(q.correct_answer)) correct += 1;
    }
  }
  return Math.round((correct / arr.length) * 100);
}

// A tiny default quiz we can reuse when auto-creating
function buildDefaultQuestions(moduleTitle = 'Module') {
  return [
    {
      id: 'q1',
      type: 'multiple_choice',
      text: `Which action is safest when an email about "${moduleTitle}" looks suspicious?`,
      options: [
        'Click the link to verify',
        'Download the attachment to inspect it',
        'Report it to IT/Security first',
        'Reply asking for clarification'
      ],
      correct_answer: 'Report it to IT/Security first',
    },
    {
      id: 'q2',
      type: 'true_false',
      text: 'Hovering links before clicking can reveal a mismatched URL.',
      correct_answer: true,
    },
    {
      id: 'q3',
      type: 'multiple_choice',
      text: 'A common red flag in malicious messages is:',
      options: [
        'Proper grammar and spelling',
        'Urgent pressure with threats or rewards',
        'Corporate sender domain',
        'Personalized greeting with your full name'
      ],
      correct_answer: 'Urgent pressure with threats or rewards',
    },
  ];
}

// Ensure a module exists and has an assessment; auto-create if missing
async function ensureAssessmentForModule(moduleId) {
  const mod = await Module.findByPk(moduleId);
  if (!mod) return { error: 'Module not found', status: 404 };

  let a = await Assessment.findOne({ where: { moduleId } });
  if (!a) {
    const questions = buildDefaultQuestions(mod.title);
    a = await Assessment.create({
      moduleId,
      title: `${mod.title} Assessment`,
      isTimed: false,
      durationSec: null,
      questions: JSON.stringify(questions),
    });
  }
  return { assessment: a };
}
// -----------------------------------

export const AssessmentController = {
  // GET /api/assessments/:assessment_id
  async getOne(req, res, next) {
    try {
      const row = await Assessment.findByPk(req.params.assessment_id);
      if (!row) return res.status(404).json({ error: 'Assessment not found' });
      res.json(toAssessmentDTO(row));
    } catch (e) { next(e); }
  },

  // GET /api/modules/:module_id/assessment
  async getByModule(req, res, next) {
    try {
      const moduleId = Number(req.params.module_id);
      const row = await Assessment.findOne({ where: { moduleId } });
      if (!row) return res.status(404).json({ error: 'Assessment for module not found' });
      res.json(toAssessmentDTO(row));
    } catch (e) { next(e); }
  },

  // Matches UI call: POST /api/assessments/:module_id
  // Auto-creates a default assessment for the module if none exists.
  async startByModule(req, res, next) {
    try {
      const moduleId = Number(req.params.module_id);
      if (!Number.isFinite(moduleId)) return res.status(400).json({ error: 'Invalid module id' });

      // 1) Ensure there is an assessment (create one if missing)
      const ensured = await ensureAssessmentForModule(moduleId);
      if (ensured.error) return res.status(ensured.status || 400).json({ error: ensured.error });
      const a = ensured.assessment;

      // 2) Find or create the user's session
      let ua = await UserAssessment.findOne({
        where: { userId: req.user.id, assessmentId: a.id },
      });
      if (!ua) {
        ua = await UserAssessment.create({
          userId: req.user.id,
          assessmentId: a.id,
          status: 'started',
          score: null,
          answers: JSON.stringify({}),
          submittedAt: null,
        });
      }

      // 3) Return the flattened shape the UI consumes
      const dto = toAssessmentDTO(a);
      const answers = safeParseJSON(ua.answers, {});
      res.json({
        ...dto,
        status: ua.status,              // 'started' | 'submitted'
        score: ua.score ?? 0,           // numeric
        answers,                         // {}
      });
    } catch (e) { next(e); }
  },

  // POST /api/assessments/:assessment_id/submit
  async submit(req, res, next) {
    try {
      const assessmentId = Number(req.params.assessment_id);
      if (!Number.isFinite(assessmentId)) return res.status(400).json({ error: 'Invalid assessment id' });

      const a = await Assessment.findByPk(assessmentId);
      if (!a) return res.status(404).json({ error: 'Assessment not found' });

      const ua = await UserAssessment.findOne({
        where: { userId: req.user.id, assessmentId },
      });
      if (!ua) return res.status(404).json({ error: 'Not assigned' });

      const dto = toAssessmentDTO(a);
      const reqAnswers = req.body?.answers;
      const answers = (reqAnswers && typeof reqAnswers === 'object') ? reqAnswers : {};
      const score = computeScore(answers, dto.questions);

      ua.answers = JSON.stringify(answers);
      ua.score = score;
      ua.status = 'submitted';
      ua.submittedAt = new Date();
      await ua.save();

      res.json({ submitted: true, score, answers });
    } catch (e) { next(e); }
  },

  // POST /api/assessments/timed  (unchanged)
  async createTimed(req, res, next) {
    try {
      const { moduleId, title, durationSec, questions } = (req.body || {});
      if (!moduleId) return res.status(400).json({ error: 'moduleId is required' });
      if (!title) return res.status(400).json({ error: 'title is required' });

      const a = await Assessment.create({
        moduleId,
        title,
        isTimed: true,
        durationSec: durationSec ?? null,
        questions: JSON.stringify(Array.isArray(questions) ? questions : []),
      });

      res.status(201).json(toAssessmentDTO(a));
    } catch (e) { next(e); }
  },

  // Optional helper list for other screens
  async my(req, res, next) {
    try {
      const subs = await UserAssessment.findAll({
        where: { userId: req.user.id },
        include: [{ model: Assessment, as: 'assessment', include: [{ model: Module, as: 'module' }] }],
        order: [['id', 'ASC']],
      });
      res.json(subs);
    } catch (e) { next(e); }
  },
};
