import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { env } from '../config/env.js';
import { User } from '../models/associations.js';

export const AuthService = {
  // Returns { access_token, token, user }
  async register({ email, name, password, role }) {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw Object.assign(new Error('Email already in use'), { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      name,
      passwordHash,
      role: role || 'learner',
    });

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });

    // expose both keys for client compatibility
    return { access_token: token, token, user: user.toSafeJSON() };
  },

  // Returns { access_token, token, user }
  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });

    return { access_token: token, token, user: user.toSafeJSON() };
  },

  async setup2FA(userId) {
    const user = await User.findByPk(userId);
    const secret = speakeasy.generateSecret({ name: `CyberApp (${user.email})` });
    user.twoFASecret = secret.base32;
    await user.save();
    const otpauth = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauth);
    return { otpauth, qrDataUrl };
  },

  async verify2FA(userId, token) {
    const user = await User.findByPk(userId);
    if (!user.twoFASecret) throw Object.assign(new Error('2FA not set up'), { status: 400 });
    const ok = speakeasy.totp.verify({ secret: user.twoFASecret, encoding: 'base32', token });
    if (!ok) throw Object.assign(new Error('Invalid code'), { status: 400 });
    user.twoFAEnabled = true;
    await user.save();
    return { enabled: true };
  },

  async disable2FA(userId) {
    const user = await User.findByPk(userId);
    user.twoFAEnabled = false;
    user.twoFASecret = null;
    await user.save();
    return { disabled: true };
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw Object.assign(new Error('Current password incorrect'), { status: 400 });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { changed: true };
  },

  async otpRequest(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpCode = code;
    user.otpExpiresAt = expires;
    await user.save();
    return { message: 'OTP generated', devCode: code, expiresAt: expires };
  },

  async otpVerify(email, code) {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.otpCode || user.otpCode !== code || new Date() > user.otpExpiresAt) {
      throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
    }
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();
    return { verified: true };
  },

  async forgotPassword(email) {
    return this.otpRequest(email);
  },

  async resetPassword(email, newPassword) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { reset: true };
  },
};
