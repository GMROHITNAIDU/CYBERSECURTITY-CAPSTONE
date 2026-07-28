import { Notification } from '../models/associations.js';
export const NotifyController = {
  async mine(req,res,next){ try{ const rows=await Notification.findAll({ where:{ userId:req.user.id }, order:[['id','DESC']] }); res.json(rows);}catch(e){ next(e);} },
  async markAllRead(req,res,next){ try{ await Notification.update({ isRead:true }, { where:{ userId:req.user.id } }); res.json({ updated:true }); }catch(e){ next(e);} },
  async create(req,res,next){ try{ const row=await Notification.create({ userId:req.user.id, type:req.body.type||'info', message:req.body.message||'' }); res.status(201).json(row);}catch(e){ next(e);} },
};
