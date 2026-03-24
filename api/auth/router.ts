import { Router } from 'express';
import { AuthController } from './controller';
import { validate } from '../../src/middlewares';
import { authBodySchema } from './schema';

export const authRouter = Router();

authRouter
    .route('/register')
    .post(validate(authBodySchema, 'body'), AuthController.register);

authRouter
    .route('/login')
    .post(validate(authBodySchema, 'body'), AuthController.login);

authRouter.route('/refresh').post(AuthController.refresh);
authRouter.route('/logout').post(AuthController.logout);
