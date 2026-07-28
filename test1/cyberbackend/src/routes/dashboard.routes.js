import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { AdminController } from '../controllers/admin.controller.js';

const r = Router();
r.get('/dashboard/stats', auth(true), DashboardController.stats);
r.get('/dashboard/user-progress', auth(true), DashboardController.userProgress);
r.get('/admin/users', auth(true), adminOnly, AdminController.listUsers);
r.post('/admin/users', auth(true), adminOnly, AdminController.createUser);
r.put('/admin/users/:user_id', auth(true), adminOnly, AdminController.updateUser);
r.delete('/admin/users/:user_id', auth(true), adminOnly, AdminController.deleteUser);
r.get('/admin/analytics/overview', auth(true), adminOnly, AdminController.analyticsOverview);
export default r;
