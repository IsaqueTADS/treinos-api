import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { authRoute } from "./routes/auth.js";
import { homeRoutes } from "./routes/home.js";
import { statsRoutes } from "./routes/stats.js";
import { WorkoutPlan } from "./routes/workout-plan.js";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const app = Fastify({
  logger: envToLogger["development"] ?? true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Treinos API",
      description:
        "API RESTful para gerenciamento de treinos, permitindo criação, edição, listagem e exclusão de treinos",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:3333/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

await app.register(ScalarApiReference, {
  routePrefix: "/docs",
  configuration: {
    theme: "bluePlanet",
    sources: [
      {
        title: "Treinos API",
        slug: "treinos-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

await app.register(fastifyCors, {
  origin: ["http://localhost:3333"],
  credentials: true,
});

app.route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.register(homeRoutes, { prefix: "/home" });
app.register(WorkoutPlan, { prefix: "/workout-plans" });
app.register(statsRoutes, { prefix: "/stats" });
app.register(authRoute, { prefix: "/" });

try {
  await app.listen({ port: Number(process.env.PORT) || 3333 }).then(() => {
    console.log("🚀 HTTP server running on http://localhost:3333/");
    console.log("📚 Docs available at http://localhost:3333/docs/");
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
