import { sequelize } from './index.js';
import { User, Module, Assessment, Simulation, Policy } from '../models/associations.js';
import bcrypt from 'bcryptjs';

(async () => {
  try {
    await sequelize.sync();
    const count = await User.count();
    if (count === 0) {
      const adminHash = await bcrypt.hash('admin123', 10);
      const learnerHash = await bcrypt.hash('user12345', 10);
      await User.create({ email: 'admin@example.com', name: 'Admin', passwordHash: adminHash, role: 'admin' });
      await User.create({ email: 'learner@example.com', name: 'Learner', passwordHash: learnerHash, role: 'learner' });
      await Module.bulkCreate([
        { title: 'Security Awareness 101', description: 'Basics of cybersecurity hygiene', isActive: true },
        { title: 'Phishing Simulation', description: 'Hands-on simulation module', isActive: true },
      ]);
      await Assessment.create({ moduleId: 1, title: 'Quiz 1', questions: JSON.stringify([{q:'What is phishing?',a:['a','b']}]) });
      await Simulation.create({ name: 'Phishing Campaign A', status: 'scheduled' });
      await Policy.create({ title: 'Acceptable Use Policy', content: 'Follow best practices', version: 'v1' });
      console.log('Seeded defaults');
    } else {
      console.log('Users exist; skipping seed');
    }
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
