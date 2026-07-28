import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { ProgressController } from '../controllers/progress.controller.js';

const r = Router();
r.get('/progress/my', auth(true), ProgressController.my);
export default r;
