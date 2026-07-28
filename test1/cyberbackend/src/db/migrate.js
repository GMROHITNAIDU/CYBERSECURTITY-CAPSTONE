import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './index.js';
const umzug = new Umzug({
  migrations: { glob: 'src/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});
const direction = process.argv[2] || 'up';
(async () => {
  if (direction === 'down') await umzug.down(); else await umzug.up();
  process.exit(0);
})();
