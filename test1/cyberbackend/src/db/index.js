import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
let sequelize;
if (env.databaseUrl) {
  sequelize = new Sequelize(env.databaseUrl, { logging: false });
} else {
  sequelize = new Sequelize({ dialect: env.dbDialect, storage: env.dbStorage, logging: false });
}
export { sequelize };
