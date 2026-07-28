import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { httpLogger } from './middleware/logger.js';
import { notFound, errorHandler } from './middleware/errors.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import moduleRoutes from './routes/module.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import simRoutes from './routes/sim.routes.js';
import policyRoutes from './routes/policy.routes.js';
import notifyRoutes from './routes/notify.routes.js';
import fileRoutes from './routes/file.routes.js';
import progressRoutes from './routes/progress.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(httpLogger);

// Static for avatars if needed
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/api/files/avatar', express.static(path.join(__dirname, 'public', 'avatars')));

// Health
app.get('/api/health', (_req, res) => res.json({ ok:true }));

// Mount all feature routes under /api
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', moduleRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', simRoutes);
app.use('/api', policyRoutes);
app.use('/api', notifyRoutes);
app.use('/api', fileRoutes);
app.use('/api', progressRoutes);
app.use('/api', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
