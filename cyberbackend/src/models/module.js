import { DataTypes, Model } from 'sequelize';

export class Module extends Model {}

export default (sequelize) => {
  Module.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      // UI expects: module_type (snake); DB: moduleType (camel)
      moduleType: {
        type: DataTypes.ENUM('phishing', 'password_security', 'social_engineering', 'data_privacy'),
        allowNull: false,
        defaultValue: 'phishing',
      },

      // UI expects: title, description
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(800), allowNull: false, defaultValue: '' },

      // UI expects: duration_minutes, difficulty_level
      durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
      difficultyLevel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // 1..5

      // Optional rich content
      content: { type: DataTypes.TEXT, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      tableName: 'modules',
      modelName: 'Module',
      timestamps: true,
    }
  );
  return Module;
};
