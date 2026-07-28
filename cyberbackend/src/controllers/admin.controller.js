import { User } from '../models/associations.js';
import bcrypt from 'bcryptjs';
export const AdminController = {
  async listUsers(req,res,next){ try{ const rows=await User.findAll({ order:[['id','ASC']] }); res.json(rows.map(u=>u.toSafeJSON())); }catch(e){ next(e);} },
  async createUser(req,res,next){ try{ const { email, full_name, password, role } = req.body; const passwordHash = await bcrypt.hash(password||'user12345',10); const u = await User.create({ email, name: full_name || 'User', passwordHash, role: role||'learner' }); res.status(201).json(u.toSafeJSON()); }catch(e){ next(e);} },
  async updateUser(req,res,next){ try{ const { full_name, role } = req.body; const u=await User.findByPk(req.params.user_id); if(!u) return res.status(404).json({error:'Not found'}); if(full_name) u.name=full_name; if(role) u.role=role; await u.save(); res.json(u.toSafeJSON()); }catch(e){ next(e);} },
  async deleteUser(req,res,next){ try{ const u=await User.findByPk(req.params.user_id); if(!u) return res.status(404).json({error:'Not found'}); await u.destroy(); res.json({ success:true }); }catch(e){ next(e);} },
  async analyticsOverview(req,res,next){ try{ res.json({ usersGrowth: [5,9,12,18,27], activeUsers: 42, assessmentsTaken: 77, completionRate: 0.61 }); }catch(e){ next(e);} },
};
