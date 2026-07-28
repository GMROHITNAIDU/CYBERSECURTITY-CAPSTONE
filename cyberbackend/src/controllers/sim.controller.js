import { Simulation } from '../models/associations.js';

function parseJSON(maybe) {
  if (!maybe) return null;
  try { return JSON.parse(maybe); } catch { return null; }
}

function toDTO(row) {
  const cfg = parseJSON(row.config) || {};
  const res = parseJSON(row.result) || [];

  // Normalize defaults so the UI never sees undefined
  const scenario_type = cfg.scenario_type || 'phishing_email';
  const title = row.name || cfg.title || 'Simulation';
  const description = cfg.description || '';
  const scheduled_at = cfg.scheduled_at || row.lastRunAt || null;
  const target_users = Array.isArray(cfg.target_users) ? cfg.target_users : [];

  return {
    id: row.id,
    scenario_type,
    status: row.status || 'scheduled',
    title,
    description,
    scheduled_at,
    target_users,
    results: Array.isArray(res) ? res : [],
  };
}

export const SimController = {
  // GET /api/simulations  (admin)  and  /api/simulations/my (alias)
  async list(req, res, next) {
    try {
      const rows = await Simulation.findAll({ order: [['id', 'DESC']] });
      const payload = rows.map(toDTO);
      res.json(payload);
    } catch (e) { next(e); }
  },

  // POST /api/simulations   (admin)
  // Accept UI shape and persist into { name, config(JSON), status }
  async create(req, res, next) {
    try {
      const {
        title,
        scenario_type = 'phishing_email',
        description = '',
        scheduled_at = null,
        target_users = [],
        status = 'scheduled',
      } = req.body || {};

      const name = title || `Simulation ${new Date().toISOString()}`;
      const config = JSON.stringify({
        scenario_type,
        title: name,
        description,
        scheduled_at,
        target_users,
      });

      const row = await Simulation.create({ name, config, status });
      res.status(201).json(toDTO(row));
    } catch (e) { next(e); }
  },

  // PUT /api/admin/simulations/:simulation_id   (admin)
  async update(req, res, next) {
    try {
      const row = await Simulation.findByPk(req.params.simulation_id);
      if (!row) return res.status(404).json({ error: 'Not found' });

      const cfg = parseJSON(row.config) || {};
      const {
        title,
        scenario_type,
        description,
        scheduled_at,
        target_users,
        status,
      } = req.body || {};

      if (typeof title === 'string') {
        row.name = title;
        cfg.title = title;
      }
      if (typeof scenario_type === 'string') cfg.scenario_type = scenario_type;
      if (typeof description === 'string') cfg.description = description;
      if (typeof scheduled_at === 'string' || scheduled_at === null) cfg.scheduled_at = scheduled_at;
      if (Array.isArray(target_users)) cfg.target_users = target_users;
      if (typeof status === 'string') row.status = status;

      row.config = JSON.stringify(cfg);
      await row.save();
      res.json(toDTO(row));
    } catch (e) { next(e); }
  },

  // DELETE /api/admin/simulations/:simulation_id   (admin)
  async del(req, res, next) {
    try {
      const row = await Simulation.findByPk(req.params.simulation_id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      await row.destroy();
      res.json({ success: true });
    } catch (e) { next(e); }
  },

  // POST /api/admin/simulations/:simulation_id/run   (admin)
  async runNow(req, res, next) {
    try {
      const row = await Simulation.findByPk(req.params.simulation_id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      row.status = 'active';
      row.lastRunAt = new Date();
      await row.save();
      res.json({ started: true, simulation: toDTO(row) });
    } catch (e) { next(e); }
  },

  // POST /api/admin/simulations/:simulation_id/start   (admin)
  async start(req, res, next) { return SimController.runNow(req, res, next); },

  // POST /api/admin/simulations/:simulation_id/stop   (admin)
  async stop(req, res, next) {
    try {
      const row = await Simulation.findByPk(req.params.simulation_id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      row.status = 'stopped';
      await row.save();
      res.json({ stopped: true, simulation: toDTO(row) });
    } catch (e) { next(e); }
  },

  // GET /api/simulations/:simulation_id/results
  async results(req, res, next) {
    try {
      const row = await Simulation.findByPk(req.params.simulation_id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      const dto = toDTO(row);
      res.json({ result: dto.results.length ? dto.results : { status: dto.status, lastRunAt: dto.scheduled_at } });
    } catch (e) { next(e); }
  },
};
