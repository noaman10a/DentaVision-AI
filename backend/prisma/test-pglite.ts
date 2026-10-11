import { PGlite } from "@electric-sql/pglite";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function test() {
  const pglite = new PGlite();
  
  const mockPool: any = {
    options: {},
    async connect() {
      return {
        query: (text: string, params: any[]) => pglite.query(text, params),
        release: () => {},
      };
    },
    async query(text: string, params: any[]) {
      return pglite.query(text, params);
    },
    async end() {
      return pglite.close();
    },
    on() {},
  };

  const adapter = new PrismaPg(mockPool);
  const prisma = new PrismaClient({ adapter });

  console.log("Testing PGlite Prisma adapter...");
  const res = await prisma.$queryRaw`SELECT 1 + 1 AS sum`;
  console.log("QueryResult:", res);
}

test().catch(console.error);
