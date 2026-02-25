import "dotenv/config";

import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(5),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(_env.error.format(), null, 2));
  throw new Error(
    "Environment validation failed. Please check your .env file."
  );
}

export const env = _env.data;
