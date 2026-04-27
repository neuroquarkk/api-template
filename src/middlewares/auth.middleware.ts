import type { NextFunction, Request, Response } from 'express';
import { ApiError, JWT } from '@utils';
import { HttpStatusCode } from '@constants';

export function auth() {
    return async function (req: Request, _res: Response, next: NextFunction) {
        try {
            const token =
                req.headers.authorization?.split(' ')[1] ||
                req.cookies?.['accessToken'];

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
