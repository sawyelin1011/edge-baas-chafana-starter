import { Hono } from 'hono';
import { apiReference } from '@scalar/hono-api-reference';
import type { Env } from './types';

// Import generated metadata and OpenAPI spec
import metadata from '../.output/metadata.json';
import openApiSpec from '../.output/openapi.json';
// Mount generated router to expose API endpoints from .output
import generatedApp from '../.output/router';

const app = new Hono<Env>();

// Home page with API status and metadata
app.get('/', (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${metadata.apiName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; max-width: 600px; text-align: center; }
        h1 { color: #333; margin-bottom: 10px; font-size: 2.5em; }
        .version { color: #999; font-size: 0.9em; margin-bottom: 20px; }
        .status { display: inline-block; background: #4caf50; color: white; padding: 8px 16px; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .resources { margin: 30px 0; text-align: left; }
        .resources h3 { color: #667eea; margin-bottom: 15px; }
        .resource-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .resource-tag { background: #f0f0f0; padding: 10px; border-radius: 6px; font-size: 0.9em; color: #333; }
        .links { margin-top: 30px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; transition: background 0.3s; }
        .btn:hover { background: #764ba2; }
        .btn-secondary { background: #999; }
        .btn-secondary:hover { background: #777; }
        .info { background: #f9f9f9; padding: 15px; border-left: 4px solid #667eea; margin-top: 20px; text-align: left; }
        .info p { margin: 5px 0; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 ${metadata.apiName}</h1>
        <div class="version">v${metadata.apiVersion}</div>
        <div class="status">✅ API Running</div>
        
        <div class="resources">
          <h3>📦 Resources</h3>
          <div class="resource-list">
            ${metadata.resources.map((r: string) => `<span class="resource-tag">${r}</span>`).join('')}
          </div>
        </div>

        <div class="links">
          <a href="/docs" class="btn">📖 API Docs</a>
          <a href="/health" class="btn btn-secondary">❤️ Health</a>
        </div>

        <div class="info">
          <p><strong>Generated:</strong> ${new Date(metadata.generatedAt).toLocaleString()}</p>
          <p><strong>Endpoints:</strong> Browse <a href="/docs" style="color: #667eea; text-decoration: none;">API Documentation</a> for full endpoint list</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return c.html(html);
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: metadata.apiName,
    version: metadata.apiVersion,
  });
});

// Serve OpenAPI spec from generated file
app.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

// API Documentation with Scalar - uses OpenAPI spec
app.get('/docs', apiReference({
  spec: {
    url: '/openapi.json',
  },
  theme: 'purple',
  defaultHttpClient: {
    targetKey: 'js',
    clientKey: 'fetch',
  },
}));

// Mount generated API routes (register after docs/openapi handlers)
app.route('/', generatedApp);

// 404 handler - catch-all for undefined routes
app.all('*', (c) => {
  return c.json({ 
    error: 'Not Found', 
    message: `${c.req.method} ${c.req.path} not found. See /docs for available endpoints`,
    status: 404,
    availableEndpoints: 'GET /docs, GET /health, GET /'
  }, 404);
});

export default app;
