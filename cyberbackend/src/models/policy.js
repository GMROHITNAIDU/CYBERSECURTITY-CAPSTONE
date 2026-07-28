import { DataTypes, Model } from 'sequelize';

export class Policy extends Model {}

export default (sequelize) => {
  Policy.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },

      // NEW fields expected by the UI
      category: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'General' },
      description: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '' },
      effectiveDate: { type: DataTypes.DATE, allowNull: true },

      version: { type: DataTypes.STRING(40), allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      tableName: 'policies',
      modelName: 'Policy',
      // createdAt/updatedAt are on by default; UI uses created_at
      underscored: false,
      timestamps: true,
    }
  );
  return Policy;
};
