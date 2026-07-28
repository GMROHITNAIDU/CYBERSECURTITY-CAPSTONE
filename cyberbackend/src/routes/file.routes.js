import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { auth } from '../middleware/auth.js';
import { FileController } from '../controllers/file.controller.js';

const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null, env.uploadsDir),
  filename: (req,file,cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const r = Router();
r.post('/files/upload', auth(true), upload.array('files', 10), FileController.upload);
r.get('/files', auth(true), FileController.list);
r.get('/files/:file_id/download', auth(true), FileController.download);
r.delete('/files/:file_id', auth(true), FileController.del);
export default r;
