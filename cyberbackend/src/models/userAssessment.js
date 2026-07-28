import { DataTypes, Model } from 'sequelize';
export class UserAssessment extends Model {}
export default (sequelize) => {
  UserAssessment.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    assessmentId: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.FLOAT, allowNull: true },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
    answers: { type: DataTypes.TEXT, allowNull: true }, // JSON
    status: { type: DataTypes.ENUM('assigned','submitted','graded'), defaultValue: 'assigned' },
  }, { sequelize, tableName: 'user_assessments', modelName: 'UserAssessment' });
  return UserAssessment;
};
