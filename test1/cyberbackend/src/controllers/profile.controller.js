import { User } from '../models/associations.js';

export const ProfileController = {
  async get(req,res,next){ try{ const user = await User.findByPk(req.user.id); res.json(user.toSafeJSON()); }catch(e){ next(e);} },
  async update(req,res,next){ try{ const user = await User.findByPk(req.user.id); const { name, email } = req.body; if(name) user.name=name; if(email) user.email=email; await user.save(); res.json(user.toSafeJSON()); }catch(e){ next(e);} },
  async preferencesGet(req,res,next){ try{ const user = await User.findByPk(req.user.id); const prefs = user.preferences ? JSON.parse(user.preferences) : {}; res.json(prefs);}catch(e){ next(e);} },
  async preferencesPut(req,res,next){ try{ const user = await User.findByPk(req.user.id); user.preferences = JSON.stringify(req.body||{}); await user.save(); res.json({ saved: true }); }catch(e){ next(e);} },
};
