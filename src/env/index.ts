import "dotenv/config";

import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(5),
  BETTER_AUTH_SECRET: z.string().min(5),
  GOOGLE_CLIENT_ID: z.string().min(5),
  GOOGLE_CLIENT_SECRET: z.string().min(5),
  FRONTEND_URL: z.string().min(5).default("http://localhost:3000"),
  API_URL: z.string().min(5).default("http://localhost:3333"),
  PORT: z.string().min(4).default("3333"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(4),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
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
