import { DataTypes, Model } from 'sequelize';

export class UserModuleProgress extends Model {}

export default (sequelize) => {
  UserModuleProgress.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      moduleId: { type: DataTypes.INTEGER, allowNull: false },
      completedPercent: { type: DataTypes.INTEGER, defaultValue: 0 },
      lastActivityAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      tableName: 'user_module_progress',
      modelName: 'UserModuleProgress',
      indexes: [
        { unique: true, fields: ['userId', 'moduleId'] },
        { fields: ['userId'] },
      ],
    }
  );
  return UserModuleProgress;
};
