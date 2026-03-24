import type { Request } from 'express';

export {};

declare global {
    namespace Express {
        interface Request {
            validatedQuery: any;
            user?: {
                id: string;
            };
        }
    }
}
