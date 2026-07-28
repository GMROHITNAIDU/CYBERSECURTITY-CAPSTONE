import { Policy } from '../models/associations.js';

/** Normalize DB row -> UI DTO */
function toDTO(row) {
  const effective_date = row.effectiveDate || row.createdAt || null;
  const isActive = !!row.isActive;

  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    version: row.version || '1.0',
    category: row.category || 'General',
    description: row.description || (row.content ? String(row.content).slice(0, 160) : ''),
    effective_date,
    created_at: row.createdAt || null,

    // both camel and snake for UI compatibility
    isActive,
    is_active: isActive,
  };
}

export const PolicyController = {
  /** GET /api/policies (active only) */
  async list(_req, res, next) {
    try {
      const rows = await Policy.findAll({ where: { isActive: true }, order: [['id', 'ASC']] });
      res.json(rows.map(toDTO));
    } catch (e) { next(e); }
  },

  /** GET /api/admin/policies (all) */
  async listAdmin(_req, res, next) {
    try {
      const rows = await Policy.findAll({ order: [['id', 'ASC']] });
      res.json(rows.map(toDTO));
    } catch (e) { next(e); }
  },

  /** GET /api/admin/policies/:policy_id */
  async getOneAdmin(req, res, next) {
    try {
      const row = await Policy.findByPk(req.params.policy_id);
      if (!row) return res.status(404).json({ error: 'Policy not found' });
      res.json(toDTO(row));
    } catch (e) { next(e); }
  },

  /** POST /api/admin/policies */
  async createAdmin(req, res, next) {
    try {
      const {
        title,
        content,
        version = '1.0',
        category = 'General',
        description,
        effective_date,
        isActive = true,
      } = req.body || {};

      if (!title || !content) {
        return res.status(400).json({ error: 'title and content are required' });
      }

      const row = await Policy.create({
        title,
        content,
        version,
        category,
        description: typeof description === 'string' ? description : String(content).slice(0, 160),
        effectiveDate: effective_date || null,
        isActive,
      });

      res.status(201).json(toDTO(row));
    } catch (e) { next(e); }
  },

  /** PUT /api/admin/policies/:policy_id */
  async updateAdmin(req, res, next) {
    try {
      const row = await Policy.findByPk(req.params.policy_id);
      if (!row) return res.status(404).json({ error: 'Policy not found' });

      const {
        title,
        content,
        version,
        category,
        description,
        effective_date,
        isActive,
      } = req.body || {};

      if (title !== undefined) row.title = title;
      if (content !== undefined) row.content = content;
      if (version !== undefined) row.version = version;
      if (category !== undefined) row.category = category;
      if (description !== undefined) row.description = description;
      if (effective_date !== undefined) row.effectiveDate = effective_date;
      if (typeof isActive === 'boolean') row.isActive = isActive;

      await row.save();
      res.json(toDTO(row));
    } catch (e) { next(e); }
  },

  /** POST /api/admin/policies/:policy_id/toggle */
  async toggleAdmin(req, res, next) {
    try {
      const row = await Policy.findByPk(req.params.policy_id);
      if (!row) return res.status(404).json({ error: 'Policy not found' });
      row.isActive = !row.isActive;
      await row.save();
      res.json(toDTO(row));
    } catch (e) { next(e); }
  },

  /** DELETE /api/admin/policies/:policy_id */
  async deleteAdmin(req, res, next) {
    try {
      const row = await Policy.findByPk(req.params.policy_id);
      if (!row) return res.status(404).json({ error: 'Policy not found' });

      // Hard delete; if you prefer soft delete, comment the destroy()
      // and set isActive=false instead.
      await row.destroy();
      res.status(204).end();
    } catch (e) { next(e); }
  },
};
