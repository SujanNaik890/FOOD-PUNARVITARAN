import express from 'express';
import { RegisterUserSchema, LoginSchema } from '@foodbridge/shared';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerHandler, loginHandler, logoutHandler, meHandler } from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/register', validate(RegisterUserSchema), registerHandler);
authRouter.post('/login', validate(LoginSchema), loginHandler);
authRouter.get('/me', authenticate, meHandler);
authRouter.post('/logout', logoutHandler);
