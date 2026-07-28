import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { FileStore } from '../models/associations.js';

export const FileController = {
  async upload(req,res,next){
    try{
      const files = req.files || [];
      const saved = await Promise.all(files.map(f => FileStore.create({
        ownerId: req.user?.id || null,
        originalName: f.originalname,
        filename: f.filename,
        mimetype: f.mimetype,
        size: f.size,
        description: req.body.description || null,
        tags: req.body.tags || null,
        isPublic: req.body.is_public === 'true' || req.body.is_public === true
      }).then(r => r)));
      res.status(201).json({ uploaded: saved });
    }catch(e){ next(e); }
  },
  async list(req,res,next){
    try{ const rows=await FileStore.findAll({ order:[['id','DESC']] }); res.json(rows);}catch(e){ next(e); }
  },
  async download(req,res,next){
    try{
      const row = await FileStore.findByPk(req.params.file_id);
      if(!row) return res.status(404).json({ error:'Not found' });
      const full = path.join(env.uploadsDir, row.filename);
      if(!fs.existsSync(full)) return res.status(404).json({ error:'Missing file' });
      res.download(full, row.originalName);
    }catch(e){ next(e); }
  },
  async del(req,res,next){
    try{
      const row = await FileStore.findByPk(req.params.file_id);
      if(!row) return res.status(404).json({ error:'Not found' });
      try{ fs.unlinkSync(path.join(env.uploadsDir, row.filename)); }catch{}
      await row.destroy(); res.json({ success:true });
    }catch(e){ next(e); }
  }
};
