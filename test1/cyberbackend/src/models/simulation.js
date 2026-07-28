import { DataTypes, Model } from 'sequelize';
export class Simulation extends Model {}
export default (sequelize) => {
  Simulation.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    config: { type: DataTypes.TEXT, allowNull: true }, // JSON
    status: { type: DataTypes.ENUM('scheduled','active','completed','stopped'), defaultValue: 'scheduled' },
    lastRunAt: { type: DataTypes.DATE, allowNull: true },
    result: { type: DataTypes.TEXT, allowNull: true }, // JSON
  }, { sequelize, tableName: 'simulations', modelName: 'Simulation' });
  return Simulation;
};
