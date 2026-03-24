import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().positive().int().default(8080),
    DATABASE_URL: z.string().trim(),

    ACCESS_SECRET: z.string().trim().default('123'),
    REFRESH_SECRET: z.string().trim().default('abc'),
    ACCESS_EXPIRY: z.string().trim().default('30m'),
    REFRESH_EXPIRY: z.string().trim().default('7d'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error(result.error.issues);
    throw new Error('Invalid env vars');
}

const isProd = result.data.NODE_ENV === 'production';

export const config = {
    ...result.data,
    IsProd: isProd,
    MorganFormat: isProd ? 'combined' : 'dev',
};
