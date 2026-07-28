export function notFound(req,res,next){ res.status(404).json({ error:'Not found' }); }
export function errorHandler(err, req, res, next){ const s=err.status||500; res.status(s).json({ error: err.message || 'Server error' }); }
