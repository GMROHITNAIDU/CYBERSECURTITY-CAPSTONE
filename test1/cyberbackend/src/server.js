import app from './app.js';
import { env } from './config/env.js';
import { sequelize } from './models/associations.js';
import { logger } from './utils/logger.js';

const start = async () => {
  try{
    await sequelize.authenticate();
    logger.info('DB connected ✔');
    app.listen(env.port, () => logger.info(`Server http://0.0.0.0:${env.port}`));
  }catch(e){
    logger.error(e.message); process.exit(1);
  }
};
start();
