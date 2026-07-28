import { DataTypes, Model } from 'sequelize';
export class FileStore extends Model {}
export default (sequelize) => {
  FileStore.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ownerId: { type: DataTypes.INTEGER, allowNull: true },
    originalName: { type: DataTypes.STRING(255), allowNull: false },
    filename: { type: DataTypes.STRING(255), allowNull: false },
    mimetype: { type: DataTypes.STRING(100), allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.TEXT, allowNull: true }, // JSON array
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { sequelize, tableName: 'files', modelName: 'FileStore' });
  return FileStore;
};
