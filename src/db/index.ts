import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '@config';
import { PrismaClient } from 'generated/prisma/client';

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

export async function checkConn() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connection successful');
    } catch (error) {
        console.error(error);
        throw new Error('Database connection failed');
    }
}
