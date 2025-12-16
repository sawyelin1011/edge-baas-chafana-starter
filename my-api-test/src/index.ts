import { fromHono } from "chanfana";
import { Hono } from "hono";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
// TODO: Add generated endpoints here

// Export the Hono app
export default app;