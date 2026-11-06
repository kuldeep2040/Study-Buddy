// /api/auth/* — URL → (middleware) → controller. No logic here, just wiring.
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { signupSchema, loginSchema } from '../validators/auth.schemas.js';

export const authRouter = Router();

authRouter.post('/signup', validate({ body: signupSchema }), authController.signup);
authRouter.post('/login', validate({ body: loginSchema }), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
