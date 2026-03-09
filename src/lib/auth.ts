import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { env } from "@/env/index.js";

import { prisma } from "./db.js";

export const auth = betterAuth({
  baseURL: env.API_URL,
  trustedOrigins: [env.FRONTEND_URL],
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: env.NODE_ENV === "production" ? ".isaque.dev.br" : undefined,
    },
  },
});
