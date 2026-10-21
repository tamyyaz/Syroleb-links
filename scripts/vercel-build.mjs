// Build entry point used by `npm run build` (Vercel runs this).
//  - production deploys first create/update the Supabase tables with
//    `prisma db push` (non-destructive: it refuses changes that would drop
//    data instead of applying them);
//  - a deploy that contains the file scripts/run-seed.flag also loads the
//    starter data (admin account, categories, sample product, knowledge
//    base). Delete that file again right after: the seed re-applies its own
//    category/product text every time it runs.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("prisma generate");

if (process.env.VERCEL_ENV === "production" && process.env.DIRECT_URL) {
  run("prisma db push --skip-generate");
  if (existsSync("scripts/run-seed.flag")) run("tsx prisma/seed.ts");
}

run("next build");
