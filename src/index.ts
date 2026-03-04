import { app } from "./app.js";

try {
  await app.listen({ port: Number(process.env.PORT) || 3333 }).then(() => {
    console.log("🚀 HTTP server running on http://localhost:3333/");
    console.log("📚 Docs available at http://localhost:3333/docs/");
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
