import { fromHono } from "chanfana";
import { Hono } from "hono";
import { apiReference } from "@scalar/hono-api-reference";

type Env = { DB: D1Database };

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/openapi.json",
});

// Scalar API reference at /docs
app.get(
  "/docs",
  apiReference({
    spec: {
      url: "/openapi.json",
    },
    theme: "purple",
    pageTitle: "Edge-BaaS API Documentation",
  })
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "edge-baas-api",
  });
});

// Register generated endpoints here from .output/endpoints
// Example:
// import { CreatePost, ListPosts, GetPost, UpdatePost, DeletePost } from './.output/endpoints/posts';
// openapi.post('/posts', CreatePost);
// openapi.get('/posts', ListPosts);
// openapi.get('/posts/:id', GetPost);
// openapi.put('/posts/:id', UpdatePost);
// openapi.delete('/posts/:id', DeletePost);

// Export the Hono app
export default app;
