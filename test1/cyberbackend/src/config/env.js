import dotenv from 'dotenv'; dotenv.config();
export const env = {
  node: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5002', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || null,
  dbDialect: process.env.DB_DIALECT || 'sqlite',
  dbStorage: process.env.DB_STORAGE || './data.sqlite',
  uploadsDir: new URL('../../uploads', import.meta.url).pathname
};
