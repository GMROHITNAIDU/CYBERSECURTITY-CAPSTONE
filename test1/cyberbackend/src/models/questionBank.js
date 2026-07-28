import { DataTypes, Model } from 'sequelize';
export class QuestionBank extends Model {}
export default (sequelize) => {
  QuestionBank.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    items: { type: DataTypes.TEXT, allowNull: true }, // JSON array
  }, { sequelize, tableName: 'question_banks', modelName: 'QuestionBank' });
  return QuestionBank;
};
