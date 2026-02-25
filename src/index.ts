import "dotenv/config";

import Fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import z from "zod";

const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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
  await app.listen({ port: Number(process.env.PORT) || 3333 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
