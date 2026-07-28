import Joi from 'joi';
import { AuthService } from '../services/auth.service.js';

// Accept either `name` or `full_name`, plus optional role
const reg = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2),
  full_name: Joi.string().min(2),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'instructor', 'learner').optional(),
});

const log = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const AuthController = {
  async register(req, res, next) {
    try {
      const { error, value } = reg.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const payload = {
        email: value.email,
        name: value.name || value.full_name, // normalize full_name -> name
        password: value.password,
        role: value.role,
      };

      // returns { access_token, token, user }
      const result = await AuthService.register(payload);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async login(req, res, next) {
    try {
      const { error, value } = log.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
      // returns { access_token, token, user }
      const result = await AuthService.login(value);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async me(req, res) {
    res.json(req.user || null);
  },

  async setup2FA(req, res, next) {
    try {
      const r = await AuthService.setup2FA(req.user.id);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async verify2FA(req, res, next) {
    try {
      const { token } = req.body;
      const r = await AuthService.verify2FA(req.user.id, token);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async disable2FA(req, res, next) {
    try {
      const r = await AuthService.disable2FA(req.user.id);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async twoFAStatus(req, res) {
    res.json({ enabled: Boolean(req.user?.twoFAEnabled) });
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const r = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async otpRequest(req, res, next) {
    try {
      const { email } = req.body;
      const r = await AuthService.otpRequest(email);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async otpVerify(req, res, next) {
    try {
      const { email, code } = req.body;
      const r = await AuthService.otpVerify(email, code);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async forgot(req, res, next) {
    try {
      const { email } = req.body;
      const r = await AuthService.forgotPassword(email);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },

  async reset(req, res, next) {
    try {
      const { email, newPassword } = req.body;
      const r = await AuthService.resetPassword(email, newPassword);
      res.json(r);
    } catch (e) {
      next(e);
    }
  },
};
