# Edge-BaaS Rules

## Imports
```typescript
import { Hono } from 'hono';
import { fromHono, D1CreateEndpoint, D1ListEndpoint, D1ReadEndpoint, D1UpdateEndpoint, D1DeleteEndpoint } from 'chanfana'; // /cloudflare/chanfana
import { z } from 'zod';
import { Context } from 'hono';

type Env = { DB: D1Database };
type AppContext = Context<{ Bindings: Env }>;
Config Format
resources:
  - name: posts
    fields:
      - name: title
        type: string
        required: true
        searchable: true
      - name: authorId
        type: uuid
        relation: users.id
Field Types
string | text | integer | number | boolean | uuid | email | url | datetime | date | json | enum

Auto-Generated Endpoints
POST   /posts           → D1CreateEndpoint
GET    /posts           → D1ListEndpoint (search, filter, sort)
GET    /posts/:id       → D1ReadEndpoint
PUT    /posts/:id       → D1UpdateEndpoint
DELETE /posts/:id       → D1DeleteEndpoint
Chanfana Can Do ✅
CRUD operations
Pagination (offset/limit)
Filtering & search
Sorting
Relationships (FK)
Request validation (Zod)
OpenAPI docs (/docs)
Type-safe responses
Chanfana Cannot Do ❌
Webhooks (edge timeout)
Real-time (WebSocket limited)
RBAC (add middleware)
Soft deletes (custom logic)
Audit logging (add hooks)
Constraints
Max 30s execution
Max 128MB memory
Max 1GB D1 database
