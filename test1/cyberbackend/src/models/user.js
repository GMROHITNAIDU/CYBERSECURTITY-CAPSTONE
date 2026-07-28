import { DataTypes, Model } from 'sequelize';
export class User extends Model {
  toSafeJSON() { const { id, email, name, role, twoFAEnabled, createdAt, updatedAt } = this; return { id, email, name, role, twoFAEnabled, createdAt, updatedAt }; }
}
export default (sequelize) => {
  User.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    name: { type: DataTypes.STRING(120), allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin','instructor','learner'), defaultValue: 'learner' },
    twoFASecret: { type: DataTypes.STRING, allowNull: true },
    twoFAEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    otpCode: { type: DataTypes.STRING, allowNull: true },
    otpExpiresAt: { type: DataTypes.DATE, allowNull: true },
    avatarFilename: { type: DataTypes.STRING, allowNull: true },
    preferences: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  }, { sequelize, tableName: 'users', modelName: 'User' });
  return User;
};
