import { UserModuleProgress } from '../models/associations.js';

export const ProgressController = {
  // GET /api/progress/my
  async my(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const rows = await UserModuleProgress.findAll({
        where: { userId: req.user.id },
        order: [['id', 'ASC']],
      });

      // Map DB -> UI contract expected by Training.js
      const payload = rows.map((r) => {
        const pct = Number.isFinite(r.completedPercent) ? r.completedPercent : 0;
        return {
          module_id: r.moduleId,                    // UI expects snake_case id
          progress_percentage: pct,                // 0..100
          completed: pct >= 100,                   // boolean
          last_activity_at: r.lastActivityAt || null,
        };
      });

      res.json(payload);
    } catch (e) {
      next(e);
    }
  },
};
