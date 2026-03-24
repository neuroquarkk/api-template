import type { CookieOptions } from 'express';
import { config } from '../../src/config';
import { HttpStatusCode } from '../../src/constants';
import { prisma } from '../../src/db';
import type { TypedController } from '../../src/types';
import { ApiError, ApiResponse, parseDuration, JWT } from '../../src/utils';
import type { AuthBody } from './schema';
import { createId } from '@paralleldrive/cuid2';

const accessDuration = parseDuration(config.ACCESS_EXPIRY);
const refreshDuration = parseDuration(config.REFRESH_EXPIRY);

export class AuthController {
    private static readonly ACCESS_COOKIE_OPTIONS: CookieOptions = {
        httpOnly: true,
        secure: config.IsProd,
        sameSite: 'strict',
        maxAge: accessDuration,
    };

    private static readonly REFRESH_COOKIE_OPTIONS: CookieOptions = {
        httpOnly: true,
        secure: config.IsProd,
        sameSite: 'strict',
        maxAge: refreshDuration,
    };

    public static register: TypedController<AuthBody> = async (req, res) => {
        const { email, password } = req.body;

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            throw new ApiError(HttpStatusCode.CONFLICT, 'User already exists');
        }

        const hashedPassword = await Bun.password.hash(password, {
            algorithm: 'argon2id',
        });

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        return res
            .status(HttpStatusCode.CREATED)
            .json(
                new ApiResponse(HttpStatusCode.CREATED, user, 'User created')
            );
    };

    public static login: TypedController<AuthBody> = async (req, res) => {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, 'Invalid credentials');
        }

        const isPasswordCorrect = await Bun.password.verify(
            password,
            user.password
        );
        if (!isPasswordCorrect) {
            throw new ApiError(HttpStatusCode.FORBIDDEN, 'Invalid credentials');
        }

        const sessionId = createId();
        const accessToken = JWT.signAccess({ id: user.id });
        const refreshToken = JWT.signRefresh({ id: user.id, sessionId });
        const tokenHash = await Bun.password.hash(refreshToken);
        const expiresAt = new Date(Date.now() + refreshDuration);

        await prisma.session.create({
            data: {
                id: sessionId,
                userId: user.id,
                token: tokenHash,
                expiresAt,
            },
        });

        return res
            .status(HttpStatusCode.OK)
            .cookie('accessToken', accessToken, this.ACCESS_COOKIE_OPTIONS)
            .cookie('refreshToken', refreshToken, this.REFRESH_COOKIE_OPTIONS)
            .json(
                new ApiResponse(
                    HttpStatusCode.OK,
                    { accessToken, refreshToken },
                    'Login successful'
                )
            );
    };

    public static refresh: TypedController = async (req, res) => {
        const refreshToken = req.cookies?.['refreshToken'];
        if (!refreshToken) {
            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                'No refresh token found'
            );
        }

        const payload = JWT.verifyRefresh(refreshToken);
        const session = await prisma.session.findUnique({
            where: { id: payload.sessionId },
        });

        if (!session || session.expiresAt <= new Date()) {
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'Session invalid');
        }

        const isTokenValid = await Bun.password.verify(
            refreshToken,
            session.token
        );
        if (!isTokenValid) {
            throw new ApiError(
                HttpStatusCode.UNAUTHORIZED,
                'Invalid refresh token'
            );
        }

        const newAccessToken = JWT.signAccess({
            id: session.userId,
        });
        const newRefreshToken = JWT.signRefresh({
            id: session.userId,
            sessionId: session.id,
        });
        const newTokenHash = await Bun.password.hash(newRefreshToken);
        const expiresAt = new Date(Date.now() + refreshDuration);

        await prisma.session.update({
            where: { id: session.id },
            data: {
                token: newTokenHash,
                expiresAt,
            },
        });

        return res
            .status(HttpStatusCode.OK)
            .cookie('accessToken', newAccessToken, this.ACCESS_COOKIE_OPTIONS)
            .cookie(
                'refreshToken',
                newRefreshToken,
                this.REFRESH_COOKIE_OPTIONS
            )
            .json(
                new ApiResponse(
                    HttpStatusCode.OK,
                    { newAccessToken, newRefreshToken },
                    'Token refresh successful'
                )
            );
    };

    public static logout: TypedController = async (req, res) => {
        const refreshToken = req.cookies?.['refreshToken'];
        const payload = JWT.verifyRefresh(refreshToken);

        await prisma.session.delete({
            where: { id: payload.sessionId },
        });

        return res
            .status(HttpStatusCode.OK)
            .clearCookie('accessToken', {
                ...this.ACCESS_COOKIE_OPTIONS,
                maxAge: 0,
            })
            .clearCookie('refreshToken', {
                ...this.REFRESH_COOKIE_OPTIONS,
                maxAge: 0,
            })
            .json(
                new ApiResponse(
                    HttpStatusCode.OK,
                    null,
                    'Logged out successfully'
                )
            );
    };

    public static delete: TypedController = async (req, res) => {
        const userId = req.user!.id;

        await prisma.user.delete({ where: { id: userId } });

        return res
            .status(HttpStatusCode.OK)
            .clearCookie('accessToken', {
                ...this.ACCESS_COOKIE_OPTIONS,
                maxAge: 0,
            })
            .clearCookie('refreshToken', {
                ...this.REFRESH_COOKIE_OPTIONS,
                maxAge: 0,
            })
            .json(
                new ApiResponse(HttpStatusCode.GONE, null, 'Account deleted')
            );
    };
}
