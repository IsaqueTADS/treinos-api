import "dotenv/config";

import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(5),
  GOOGLE_CLIENT_ID: z.string().min(5),
  GOOGLE_CLIENT_SECRET: z.string().min(5),
  FRONTEND_URL: z.string().min(5),
  API_URL: z.string().min(5),
  PORT: z.string().min(4)
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(z.treeifyError(_env.error), null, 2));
  throw new Error(
    "Environment validation failed. Please check your .env file.",
  );
}

export const env = _env.data;
