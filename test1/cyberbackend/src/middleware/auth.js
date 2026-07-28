import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function auth(required = true) {
  return (req,res,next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (required) return res.status(401).json({ error: 'Missing token' });
      req.user = null; return next();
    }
    try { req.user = jwt.verify(token, env.jwtSecret); next(); }
    catch { return res.status(401).json({ error: 'Invalid token' }); }
  };
}
export function adminOnly(req,res,next){
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}
