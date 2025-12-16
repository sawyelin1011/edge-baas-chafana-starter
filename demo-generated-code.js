// Edge-BaaS Generated Code Demonstration
// This shows what the generator would produce

console.log('🎯 Edge-BaaS Generated Code Examples\n');

// Example 1: Zod Schema Generation
console.log('1️⃣ Generated Zod Schema (posts):');
console.log(`// src/generated/schemas/posts.ts
export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  content: z.string(),
  authorId: z.string().uuid(),
  published: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Post = z.infer<typeof PostSchema>;

export const CreatePostSchema = z.object({
  title: z.string().min(3),
  content: z.string(),
  authorId: z.string().uuid(),
  published: z.boolean().optional(),
});

export type CreatePost = z.infer<typeof CreatePostSchema>;`);

console.log('\n' + '='.repeat(60) + '\n');

// Example 2: Chanfana Endpoint Generation
console.log('2️⃣ Generated Chanfana Endpoint:');
console.log(`// src/generated/endpoints/create-post.ts
import { D1CreateEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostSchema, CreatePostSchema } from '../schemas/posts.js';

export class CreatePost extends D1CreateEndpoint {
  _meta = { 
    model: { 
      schema: PostSchema, 
      primaryKeys: ['id'], 
      tableName: 'posts' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = CreatePostSchema.parse(requestData);
    
    const finalData = {
      id: crypto.randomUUID(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return super.handle({
      ...c,
      req: {
        ...c.req,
        json: () => Promise.resolve(finalData)
      }
    } as Context);
  }
}`);

console.log('\n' + '='.repeat(60) + '\n');

// Example 3: SQL Migration Generation
console.log('3️⃣ Generated SQL Migration:');
console.log(`-- src/generated/migrations/002_create_posts_table.sql
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  authorId TEXT NOT NULL,
  published INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (authorId) REFERENCES authors(id)
);

-- Indexes for performance
CREATE INDEX idx_posts_authorId ON posts(authorId);
CREATE INDEX idx_posts_published ON posts(published);`);

console.log('\n' + '='.repeat(60) + '\n');

// Example 4: Hono Router Generation
console.log('4️⃣ Generated Hono Router:');
console.log(`// src/index.ts
import { fromHono } from "chanfana";
import { Hono } from "hono";
import { CreatePost } from "./generated/endpoints/create-post";
import { ListPosts } from "./generated/endpoints/list-posts";
import { GetPost } from "./generated/endpoints/get-post";
import { UpdatePost } from "./generated/endpoints/update-post";
import { DeletePost } from "./generated/endpoints/delete-post";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post('/posts', CreatePost);
openapi.get('/posts', ListPosts);
openapi.get('/posts/:id', GetPost);
openapi.put('/posts/:id', UpdatePost);
openapi.delete('/posts/:id', DeletePost);

// Export the Hono app
export default app;`);

console.log('\n' + '='.repeat(60) + '\n');

// Example 5: Complete API Flow
console.log('5️⃣ Complete API Flow Example:');
console.log(`# From YAML Config to Live API in 4 Steps:

1. CONFIGURATION (config.yaml):
   name: blog-api
   resources:
     - name: posts
       fields:
         - name: title
           type: string
           required: true

2. VALIDATION:
   $ edge-baas validate config.yaml
   ✅ blog-api - 1 resource

3. GENERATION:
   $ edge-baas generate config.yaml
   ✅ Generated 5 endpoints, 1 schema, 1 migration

4. DEPLOYMENT:
   $ npm run deploy
   ✅ API live at: https://your-worker.workers.dev/docs

# Auto-Generated Endpoints:
POST   /posts          → Create post
GET    /posts          → List posts (search, filter, pagination)  
GET    /posts/:id      → Get post
PUT    /posts/:id      → Update post
DELETE /posts/:id      → Delete post

# Features Included:
✓ TypeScript types
✓ Zod validation
✓ OpenAPI 3.1 docs
✓ Database migrations
✓ Foreign key relationships
✓ Search and filtering
✓ Pagination
✓ Error handling
✓ Cloudflare Workers deployment`);

console.log('\n🚀 Edge-BaaS: From YAML to Production API in Seconds!');