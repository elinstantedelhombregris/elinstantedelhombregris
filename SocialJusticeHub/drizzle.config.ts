import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "./local.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema-sqlite.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
