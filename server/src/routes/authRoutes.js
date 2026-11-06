import express from 'express';
import { RegisterUserSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@foodbridge/shared';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  forgotPasswordHandler,
  resetPasswordHandler
} from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/register', validate(RegisterUserSchema), registerHandler);
authRouter.post('/login', validate(LoginSchema), loginHandler);
authRouter.get('/me', authenticate, meHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/forgot-password', validate(ForgotPasswordSchema), forgotPasswordHandler);
authRouter.post('/reset-password', validate(ResetPasswordSchema), resetPasswordHandler);
