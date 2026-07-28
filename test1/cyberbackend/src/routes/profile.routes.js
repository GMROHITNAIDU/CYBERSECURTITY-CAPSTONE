import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { ProfileController } from '../controllers/profile.controller.js';

const r = Router();
r.get('/profile', auth(true), ProfileController.get);
r.put('/profile', auth(true), ProfileController.update);
r.get('/profile/preferences', auth(true), ProfileController.preferencesGet);
r.put('/profile/preferences', auth(true), ProfileController.preferencesPut);

// Frontend has a stray '/api/profile/preferences' call; mirror it here too
r.get('/api/profile/preferences', auth(true), ProfileController.preferencesGet);
r.put('/api/profile/preferences', auth(true), ProfileController.preferencesPut);

export default r;
