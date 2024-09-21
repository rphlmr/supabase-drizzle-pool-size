import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const max = 100;

const db1 = drizzle(
  postgres(process.env.DATABASE_URL!, { prepare: false, max })
);
const db2 = drizzle(
  postgres(process.env.DATABASE_URL!, { prepare: false, max })
);

async function runQuery(id: number) {
  try {
    console.time(`Query ${id}`);
    // Simulate load balancing on multiple clients
    const db = id % 2 === 0 ? db1 : db2;
    const dbChoice = id % 2 === 0 ? "db1" : "db2";
    await db.execute(sql`SELECT pg_sleep(2), ${id} AS query_id`);
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
