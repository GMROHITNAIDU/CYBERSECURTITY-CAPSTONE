import initUser, { User } from './user.js';
import initModule, { Module } from './module.js';
import initAssessment, { Assessment } from './assessment.js';
import initUserAssessment, { UserAssessment } from './userAssessment.js';
import initSimulation, { Simulation } from './simulation.js';
import initPolicy, { Policy } from './policy.js';
import initNotification, { Notification } from './notification.js';
import initFile, { FileStore } from './file.js';
import initProgress, { UserModuleProgress } from './progress.js';
import initCertificate, { Certificate } from './certificate.js';
import initQuestionBank, { QuestionBank } from './questionBank.js';
import { sequelize } from '../db/index.js';

// init
initUser(sequelize);
initModule(sequelize);
initAssessment(sequelize);
initUserAssessment(sequelize);
initSimulation(sequelize);
initPolicy(sequelize);
initNotification(sequelize);
initFile(sequelize);
initProgress(sequelize);
initCertificate(sequelize);
initQuestionBank(sequelize);

// relations
Module.hasMany(Assessment, { foreignKey: 'moduleId', as: 'assessments' });
Assessment.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });

User.hasMany(UserAssessment, { foreignKey: 'userId', as: 'userAssessments' });
UserAssessment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Assessment.hasMany(UserAssessment, { foreignKey: 'assessmentId', as: 'submissions' });
UserAssessment.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(FileStore, { foreignKey: 'ownerId', as: 'files' });
FileStore.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.belongsToMany(Module, { through: UserModuleProgress, foreignKey: 'userId', otherKey: 'moduleId', as: 'learningModules' });
Module.belongsToMany(User, { through: UserModuleProgress, foreignKey: 'moduleId', otherKey: 'userId', as: 'learners' });

User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Module, Assessment, UserAssessment, Simulation, Policy, Notification, FileStore, UserModuleProgress, Certificate, QuestionBank };
