import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { NotifyController } from '../controllers/notify.controller.js';

const r = Router();
r.get('/notifications/mine', auth(true), NotifyController.mine);
r.put('/notifications/mark-all-read', auth(true), NotifyController.markAllRead);
r.post('/notifications', auth(true), NotifyController.create);
export default r;
