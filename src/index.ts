import "dotenv/config";

import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

try {
  await fastify.listen({ port: Number(process.env.PORT) || 3333 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
