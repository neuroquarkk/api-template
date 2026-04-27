import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '@config';

interface AccessPayload {
    id: string;
}

interface RefreshPayload {
    id: string;
    sessionId: string;
}

export class JWT {
    public static signAccess(payload: AccessPayload): string {
        return jwt.sign(payload, config.ACCESS_SECRET, {
            expiresIn: config.ACCESS_EXPIRY,
        } as SignOptions);
    }

    public static signRefresh(payload: RefreshPayload): string {
        return jwt.sign(payload, config.REFRESH_SECRET, {
            expiresIn: config.REFRESH_EXPIRY,
        } as SignOptions);
    }

    public static verifyRefresh(token: string): RefreshPayload {
        return jwt.verify(token, config.REFRESH_SECRET) as RefreshPayload;
    }

    public static verifyAccess(token: string): AccessPayload {
        return jwt.verify(token, config.ACCESS_SECRET) as AccessPayload;
    }
}
