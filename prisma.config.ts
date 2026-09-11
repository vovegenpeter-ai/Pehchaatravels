// Prisma CLI config (migrate / db push / seed)
// ---------------------------------------------------------------------------
// Prisma CLI reads the `url` from this config when it runs. This file is
// only used by the Prisma CLI — the app runtime (Next.js) reads
// DATABASE_URL directly from process.env (loaded from .env / .env.local).
//
// This config resolves the correct connection string for CLI operations
// based on NODE_ENV so that `npx prisma migrate dev`, `prisma db push`,
// and `tsx prisma/seed.ts` always target the local/dev database.
// ---------------------------------------------------------------------------
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first so it takes precedence over .env — same
// precedence order Next.js uses when loading these files.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

function resolveDatabaseUrl(): string {
  // Production CLI operations (rare — typically only CI/CD pipelines)
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL_PROD) {
    return process.env.DATABASE_URL_PROD;
  }
  // Local / development — explicit dev string takes priority
  if (process.env.DATABASE_URL_DEV) {
    return process.env.DATABASE_URL_DEV;
  }
  // Standard DATABASE_URL (set in .env.local for local dev, or Vercel env for prod)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error(
    "DATABASE_URL is not configured. " +
      "Set DATABASE_URL (or DATABASE_URL_DEV for local) in your environment. " +
      "See .env.example for the required variables."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
