import "dotenv/config";

import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import z from "zod";

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

 app.register(ScalarApiReference, {
  routePrefix: "/docs",
  configuration: {
    theme: "bluePlanet",
  },
});

app.get(
  "/",
  {
    schema: {
      description: "testando",
      tags: ["get"],
      response: {
        200: z.object({
          hello: z.string(),
        }),
      },
    },
  },
  async (request, reply) => {
    return reply.status(200).send({ hello: "world" });
  }
);

try {
  await app.listen({ port: Number(process.env.PORT) || 3333 }).then(() => {
    console.log("🚀 HTTP server running on http://localhost:3333/");
    console.log("📚 Docs available at http://localhost:3333/docs/");
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
