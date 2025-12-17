import { fromHono } from 'chanfana';
import { Hono } from 'hono';
import { apiReference } from '@scalar/hono-api-reference';

type Env = { 
  Bindings: {
    DB: D1Database;
  }
};

const app = new Hono<Env>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: '/openapi.json',
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'edge-baas-api'
  });
});

// API Documentation with Scalar
app.get('/docs', apiReference({
  spec: {
    url: '/openapi.json',
  },
  theme: 'purple',
  defaultHttpClient: {
    targetKey: 'javascript',
    clientKey: 'fetch',
  },
}));

// Import and register generated endpoints
// After running `npm run generate`, uncomment and import your endpoints:
//
// import { CreateUser } from '../.output/endpoints/-create-user';
// import { ListUsers } from '../.output/endpoints/-list-users';
// import { GetUser } from '../.output/endpoints/-get-user';
// import { UpdateUser } from '../.output/endpoints/-update-user';
// import { DeleteUser } from '../.output/endpoints/-delete-user';
//
// openapi.post('/users', CreateUser);
// openapi.get('/users', ListUsers);
// openapi.get('/users/:id', GetUser);
// openapi.put('/users/:id', UpdateUser);
// openapi.delete('/users/:id', DeleteUser);
//
// Repeat for all resources...

// Or dynamically use the generated router:
// import generatedRouter from '../.output/router';
// app.route('/', generatedRouter);

export default app;
