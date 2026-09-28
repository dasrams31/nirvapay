import express from "express";
import next from "next";
import cors from "cors";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "8098", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();
  const server = express();

  // Basic Express Middlewares
  server.use(cors({ origin: true, credentials: true }));
  server.use(express.json({ limit: "10mb" }));
  server.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Custom Express Health Endpoint
  server.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "NirvaPay SaaS Gateway",
      version: "2.0.0",
      framework: "Express.js + Next.js",
      database: "PostgreSQL",
      timestamp: new Date().toISOString(),
    });
  });

  // Delegate all other routes to Next.js App Router & API Handlers
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> NirvaPay Express+Next.js Gateway Server running on http://${hostname}:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start NirvaPay Server:", err);
  process.exit(1);
});
