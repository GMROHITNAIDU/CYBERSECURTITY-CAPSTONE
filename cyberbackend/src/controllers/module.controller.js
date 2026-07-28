import { Module } from '../models/associations.js';

// support both camel and snake when reading legacy rows
const pick = (row, camel, snake, fallback) => {
  const v1 = row[camel];
  if (v1 !== undefined && v1 !== null) return v1;
  const v2 = row[snake];
  if (v2 !== undefined && v2 !== null) return v2;
  return fallback;
};

function toDTO(row) {
  const module_type = String(pick(row, 'moduleType', 'module_type', 'phishing') || 'phishing');
  const title = pick(row, 'title', 'title', 'Module');
  const description = pick(row, 'description', 'description', '');
  const duration_minutes_raw = pick(row, 'durationMinutes', 'duration_minutes', 10);
  const difficulty_level_raw = pick(row, 'difficultyLevel', 'difficulty_level', 1);

  const duration_minutes = Number.isFinite(Number(duration_minutes_raw)) ? Number(duration_minutes_raw) : 10;
  const difficulty_level = Number.isFinite(Number(difficulty_level_raw)) ? Number(difficulty_level_raw) : 1;

  return { id: row.id, module_type, title, description, duration_minutes, difficulty_level };
}

export const ModuleController = {
  async list(_req, res, next) {
    try {
      const rows = await Module.findAll({ order: [['id', 'ASC']] });
      res.json(rows.map(toDTO));
    } catch (e) { console.error('[ModuleController.list] error:', e); next(e); }
  },

  async getOne(req, res, next) {
    try {
      const row = await Module.findByPk(req.params.module_id);
      if (!row) return res.status(404).json({ error: 'Module not found' });
      res.json(toDTO(row));
    } catch (e) { console.error('[ModuleController.getOne] error:', e); next(e); }
  },

  async create(req, res, next) {
    try {
      const {
        title,
        description = '',
        module_type = 'phishing',
        duration_minutes = 10,
        difficulty_level = 1,
        isActive,
        content = null,
      } = req.body || {};

      if (!title) return res.status(400).json({ error: 'title is required' });

      const values = { title, description, content, moduleType: module_type, durationMinutes: duration_minutes, difficultyLevel: difficulty_level };
      if (typeof isActive === 'boolean') values.isActive = isActive;

      const row = await Module.create(values);
      res.status(201).json(toDTO(row));
    } catch (e) {
      // legacy fallback
      if (e?.original?.message?.includes('no such column') || e?.message?.includes('Unknown column')) {
        try {
          const {
            title,
            description = '',
            module_type = 'phishing',
            duration_minutes = 10,
            difficulty_level = 1,
            content = null,
          } = req.body || {};
          const row = await Module.create({
            title, description, content,
            module_type, duration_minutes, difficulty_level,
          });
          return res.status(201).json(toDTO(row));
        } catch (e2) { console.error('[ModuleController.create legacy] error:', e2); return next(e2); }
      }
      console.error('[ModuleController.create] error:', e); next(e);
    }
  },

  async update(req, res, next) {
    try {
      const row = await Module.findByPk(req.params.module_id);
      if (!row) return res.status(404).json({ error: 'Not found' });

      const {
        title, description, module_type, duration_minutes, difficulty_level, isActive, content,
      } = req.body || {};

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (content !== undefined) updates.content = content;
      if (duration_minutes !== undefined) updates.durationMinutes = Number(duration_minutes);
      if (difficulty_level !== undefined) updates.difficultyLevel = Number(difficulty_level);
      if (module_type !== undefined) updates.moduleType = String(module_type);
      if (typeof isActive === 'boolean') updates.isActive = isActive;

      await row.update(updates).catch(async (err) => {
        if (err?.original?.message?.includes('no such column') || err?.message?.includes('Unknown column')) {
          const legacyUpdates = {};
          if (title !== undefined) legacyUpdates.title = title;
          if (description !== undefined) legacyUpdates.description = description;
          if (content !== undefined) legacyUpdates.content = content;
          if (duration_minutes !== undefined) legacyUpdates.duration_minutes = Number(duration_minutes);
          if (difficulty_level !== undefined) legacyUpdates.difficulty_level = Number(difficulty_level);
          if (module_type !== undefined) legacyUpdates.module_type = String(module_type);
          await row.update(legacyUpdates);
        } else {
          throw err;
        }
      });

      res.json(toDTO(row));
    } catch (e) { console.error('[ModuleController.update] error:', e); next(e); }
  },
};
