/**
 * DentaVision AI — Database Connection Client
 * Owner: Twahir (Backend Lead)
 *
 * Configures and exports a singleton instance of the PrismaClient using Pg driver adapter.
 * Ensures we don't open duplicate database connection pools during dev reloading.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Extend the global object to prevent duplicate client instantiations in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
