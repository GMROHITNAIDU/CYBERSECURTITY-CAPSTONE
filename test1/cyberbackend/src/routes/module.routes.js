import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { ModuleController } from '../controllers/module.controller.js';

const r = Router();

r.get('/modules', auth(true), ModuleController.list);
r.get('/modules/:module_id', auth(true), ModuleController.getOne);

r.post('/admin/modules', auth(true), adminOnly, ModuleController.create);
r.put('/admin/modules/:module_id', auth(true), adminOnly, ModuleController.update);

export default r;
