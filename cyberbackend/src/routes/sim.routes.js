import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { SimController } from '../controllers/sim.controller.js';

const r = Router();
r.get('/simulations', auth(true), SimController.list);
r.get('/simulations/my', auth(true), SimController.list); // simple alias
r.post('/simulations', auth(true), adminOnly, SimController.create);
r.put('/admin/simulations/:simulation_id', auth(true), adminOnly, SimController.update);
r.delete('/admin/simulations/:simulation_id', auth(true), adminOnly, SimController.del);
r.post('/admin/simulations/:simulation_id/run', auth(true), adminOnly, SimController.runNow);
r.post('/admin/simulations/:simulation_id/start', auth(true), adminOnly, SimController.start);
r.post('/admin/simulations/:simulation_id/stop', auth(true), adminOnly, SimController.stop);
r.get('/simulations/:simulation_id/results', auth(true), SimController.results);
export default r;
