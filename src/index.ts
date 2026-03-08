import { app } from "./app.js";
import { env } from "./env/index.js";

try {
  await app.listen({ port: Number(env.PORT) }).then(() => {
    console.log(`🚀 HTTP server running on ${env.API_URL}`);
    console.log(`📚 Docs available at ${env.API_URL}/docs/`);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
