import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { PolicyController } from '../controllers/policy.controller.js';

const r = Router();

/* Public (active policies only) */
r.get('/policies', auth(true), PolicyController.list);

/* Admin */
r.get('/admin/policies', auth(true), adminOnly, PolicyController.listAdmin);
r.get('/admin/policies/:policy_id', auth(true), adminOnly, PolicyController.getOneAdmin);
r.post('/admin/policies', auth(true), adminOnly, PolicyController.createAdmin);
r.put('/admin/policies/:policy_id', auth(true), adminOnly, PolicyController.updateAdmin);
r.post('/admin/policies/:policy_id/toggle', auth(true), adminOnly, PolicyController.toggleAdmin);
r.delete('/admin/policies/:policy_id', auth(true), adminOnly, PolicyController.deleteAdmin);

export default r;
