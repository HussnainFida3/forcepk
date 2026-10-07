// Starts a local embedded PostgreSQL (no Docker needed) and keeps it alive.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), ".pgdata");
mkdirSync(dir, { recursive: true });
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: true,
});

const fresh = !existsSync(resolve(dir, "PG_VERSION"));
if (fresh) {
  console.log("Initialising Postgres data dir…");
  await pg.initialise();
}
await pg.start();
console.log("Postgres started on 127.0.0.1:5433");

try {
  await pg.createDatabase("forcepk");
  console.log("Database 'forcepk' created");
} catch {
  console.log("Database 'forcepk' already exists");
}

process.on("SIGINT", async () => { await pg.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await pg.stop(); process.exit(0); });

// Keep alive
setInterval(() => {}, 1 << 30);
