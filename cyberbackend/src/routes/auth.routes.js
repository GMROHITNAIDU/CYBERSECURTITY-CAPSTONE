import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const r = Router();
r.post('/auth/register', AuthController.register);
r.post('/auth/login', AuthController.login);
r.get('/auth/me', auth(false), AuthController.me);
r.get('/auth/2fa-status', auth(true), AuthController.twoFAStatus);
r.post('/auth/change-password', auth(true), AuthController.changePassword);
r.post('/auth/setup-2fa', auth(true), AuthController.setup2FA);
r.post('/auth/verify-2fa', auth(true), AuthController.verify2FA);
r.post('/auth/disable-2fa', auth(true), AuthController.disable2FA);
r.post('/auth/forgot-password', AuthController.forgot);
r.post('/auth/reset-password', AuthController.reset);
r.post('/auth/otp-request', AuthController.otpRequest);
r.post('/auth/otp-verify', AuthController.otpVerify);
export default r;
