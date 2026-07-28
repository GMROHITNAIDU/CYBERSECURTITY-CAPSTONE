import { DataTypes, Model } from 'sequelize';
export class Notification extends Model {}
export default (sequelize) => {
  Notification.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'info' },
    message: { type: DataTypes.STRING(500), allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { sequelize, tableName: 'notifications', modelName: 'Notification' });
  return Notification;
};
