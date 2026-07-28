import { User, Module, Assessment, Simulation } from '../models/associations.js';
export const DashboardController = {
  async stats(req,res,next){ try{
    const [users, modules, assessments, sims] = await Promise.all([User.count(), Module.count(), Assessment.count(), Simulation.count()]);
    res.json({ totals: { users, modules, assessments, simulations: sims } });
  }catch(e){ next(e);} },
  async userProgress(req,res,next){ try{
    // Basic placeholder metric
    res.json({ completionRate: 0.66, streakDays: 3, lastActive: new Date() });
  }catch(e){ next(e);} },
};
