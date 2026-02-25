import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { db } from "./db.js";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3333"],
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
});
