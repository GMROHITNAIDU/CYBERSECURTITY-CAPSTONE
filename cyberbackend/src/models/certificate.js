import { DataTypes, Model } from 'sequelize';
export class Certificate extends Model {}
export default (sequelize) => {
  Certificate.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    verificationCode: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    issuedAt: { type: DataTypes.DATE, allowNull: false },
    filePath: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, tableName: 'certificates', modelName: 'Certificate' });
  return Certificate;
};
