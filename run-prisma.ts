import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";

const db1 = new PrismaClient();
const db2 = new PrismaClient();

async function runQuery(id: number) {
  try {
    console.time(`Query ${id}`);
    const db = id % 2 === 0 ? db1 : db2;
    const dbChoice = id % 2 === 0 ? "db1" : "db2";
    await db.$queryRaw(
      Prisma.sql`SELECT ${id} AS query_id, pg_sleep(2)::text AS sleep_result`
    );
    console.timeEnd(`Query ${id}`);
    console.log(`Query ${id} completed on ${dbChoice}`);
  } catch (error) {
    console.error(`Query ${id} failed`, error);
  }
}

async function testPool() {
  const start = performance.now();
  console.log("Starting pool test...");

  // Run queries concurrently
  const queries = Array.from({ length: 300 }, (_, i) => runQuery(i + 1));

  await Promise.all(queries);

  console.log("Pool test completed");
  console.log(`Time taken: ${performance.now() - start}ms`);
}

testPool().catch(console.error);
