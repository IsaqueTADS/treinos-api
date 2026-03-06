import { app } from "./app.js";
import { env } from "./env/index.js";

try {
  await app.listen({ port: Number(env.PORT) }).then(() => {
    console.log("🚀 HTTP server running on http://localhost:3333/");
    console.log("📚 Docs available at http://localhost:3333/docs/");
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
