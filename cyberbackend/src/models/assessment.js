import { DataTypes, Model } from 'sequelize';
export class Assessment extends Model {}
export default (sequelize) => {
  Assessment.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    moduleId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    questions: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    isTimed: { type: DataTypes.BOOLEAN, defaultValue: false },
    durationSec: { type: DataTypes.INTEGER, allowNull: true },
  }, { sequelize, tableName: 'assessments', modelName: 'Assessment' });
  return Assessment;
};
