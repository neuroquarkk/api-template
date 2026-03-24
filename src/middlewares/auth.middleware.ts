import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils';
import { HttpStatusCode } from '../constants';
import { JWT } from '../utils/jwt';

export function auth() {
    return async function (req: Request, _res: Response, next: NextFunction) {
        try {
            let token: string | undefined;

            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }

            if (!token && req.cookies?.['accessToken']) {
                token = req.cookies['accessToken'];
            }

            if (!token) {
                throw new ApiError(
                    HttpStatusCode.UNAUTHORIZED,
                    'Unauthorized request'
                );
            }

            const payload = JWT.verifyAccess(token);
            req.user = {
                ...payload,
            };

            next();
        } catch (error) {
            next(
                new ApiError(
                    HttpStatusCode.UNAUTHORIZED,
                    'Invalid or expired token'
                )
            );
        }
    };
}
