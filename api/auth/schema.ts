import { z } from 'zod';

export const authBodySchema = z.object({
    email: z.email().trim(),
    password: z.string().min(6, 'Password is too short').trim(),
});

export type AuthBody = z.infer<typeof authBodySchema>;
