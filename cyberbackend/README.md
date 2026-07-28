# Cyber Express Backend (Sequelize + JWT + 2FA + Uploads)

Drop-in Node replacement for your FastAPI backend, shaped to the **cyber-main** frontend.
- Matches axios calls like `/api/auth/*`, `/api/modules`, `/api/progress/my`, `/api/files/upload`, `/api/notifications/*`, `/api/dashboard/*`, `/api/admin/*`, etc.
- SQLite by default; Postgres via `DATABASE_URL`.
- JWT auth, 2FA (TOTP with QR), OTP demo flow, file uploads (multer).

## Quick Start
```bash
npm install
cp .env.example .env
npm run migrate    # no-op unless you add migrations; sync happens in seed
npm run seed       # creates admin + sample data
npm run dev        # http://localhost:5002
```

## Default Accounts
- admin@example.com / **admin123** (role: admin)
- learner@example.com / **user12345** (role: learner)

## Endpoints (high level)
- **Auth**: `/api/auth/register` `/api/auth/login` `/api/auth/me` `/api/auth/change-password` 
  `/api/auth/setup-2fa` `/api/auth/verify-2fa` `/api/auth/disable-2fa`
  `/api/auth/forgot-password` `/api/auth/reset-password`
  `/api/auth/otp-request` `/api/auth/otp-verify`
- **Profile**: `/api/profile` (GET, PUT), `/api/profile/preferences` (GET, PUT)
  > Also mirrors stray `/api/profile/preferences` path in case the frontend double-prefixes.
- **Modules**: `/api/modules` (GET, POST admin), `/api/admin/modules/:id/toggle`
- **Assessments**: `/api/assessments/my`, `/api/assessments/:assessment_id/submit`, `/api/assessments/timed`
- **Simulations**: `/api/simulations` (GET, POST admin), admin actions: `run/start/stop/update/delete`, `/api/simulations/:id/results`
- **Policies**: `/api/policies` (GET), `/api/admin/policies` (POST)
- **Notifications**: `/api/notifications/mine`, `/api/notifications/mark-all-read`, `/api/notifications` (POST)
- **Files**: `/api/files/upload` (field: **files[]**), `/api/files` (GET), `/api/files/:id/download`, `/api/files/:id` (DELETE)
- **Progress**: `/api/progress/my`
- **Dashboard**: `/api/dashboard/stats`, `/api/dashboard/user-progress`
- **Admin Users**: `/api/admin/users` (GET, POST, PUT, DELETE)
- **Admin Analytics**: `/api/admin/analytics/overview`

Set `REACT_APP_BACKEND_URL=http://localhost:5002` in your frontend and axios base (`/api`) will align perfectly.
