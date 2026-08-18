import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
import path from "path";

async function applyMigration() {
  const dbPath = path.join(__dirname, "dev.db");
  console.log(`📁 Connecting to PGlite database at ${dbPath}...`);
  const db = new PGlite(dbPath);

  const sqlPath = path.join(__dirname, "migrations", "20260812100613_init", "migration.sql");
  console.log(`📜 Loading migration SQL from ${sqlPath}...`);
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("⚡ Executing DDL migration for all 14 approved tables...");
  await db.exec(sql);
  console.log("✅ DDL Schema migration complete!");

  await db.close();
}

applyMigration().catch(console.error);
