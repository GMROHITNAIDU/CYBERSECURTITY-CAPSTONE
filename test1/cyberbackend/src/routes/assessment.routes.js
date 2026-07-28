import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { AssessmentController } from '../controllers/assessment.controller.js';

const r = Router();

r.get('/assessments/:assessment_id', auth(true), AssessmentController.getOne);
r.get('/modules/:module_id/assessment', auth(true), AssessmentController.getByModule);

// UI calls this: POST /api/assessments/:module_id
r.post('/assessments/:module_id', auth(true), AssessmentController.startByModule);

r.post('/assessments/:assessment_id/submit', auth(true), AssessmentController.submit);
r.post('/assessments/timed', auth(true), AssessmentController.createTimed);

r.get('/assessments/my', auth(true), AssessmentController.my);

export default r;
