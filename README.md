# Edge-BaaS: Edge Backend as a Service

Generate production-ready APIs from YAML configurations using Hono + Chanfana + Cloudflare Workers.

## 🚀 Quick Start

```bash
# Install CLI
npm install -g @edge-baas/cli

# Create new project
edge-baas init my-api
cd my-api

# Generate API from config
npm run generate

# Deploy
npm run dev  # development
npm run deploy  # production
```

## ✨ Features

- **YAML Config → Production API** in seconds
- **Cloudflare Workers** deployment (D1 database)
- **Hono + Chanfana** framework
- **Zod** validation
- **OpenAPI 3.1** documentation
- **Auto-generated** CRUD endpoints
- **TypeScript** throughout
- **Monorepo** structure

## 📁 Monorepo Structure

```
edge-baas/
├── packages/
│   ├── core/              # Core generator logic
│   ├── cli/               # Command-line interface
│   ├── adapter-workers/   # Cloudflare Workers (default)
│   ├── adapter-vercel/    # Vercel Edge (placeholder)
│   └── adapter-deno/      # Deno Deploy (placeholder)
├── starter/               # Starter templates
│   ├── config/           # Example configs
│   └── src/              # Template source structure
└── examples/             # Generated examples
```

## 🔧 Configuration

Define your API with a simple YAML config:

```yaml
name: blog-api
version: 1.0.0

resources:
  - name: posts
    fields:
      - name: title
        type: string
        required: true
        searchable: true
      - name: content
        type: text
        required: true
      - name: authorId
        type: uuid
        relation: authors.id
    timestamps:
      createdAt: true
      updatedAt: true

  - name: authors
    fields:
      - name: email
        type: email
        required: true
        unique: true
      - name: name
        type: string
        required: true
```

## 📋 Generated APIs

From the config above, you get:

- ✅ **Zod Schemas** (validation)
- ✅ **Chanfana Endpoints** (CRUD)
- ✅ **Hono Router** (OpenAPI)
- ✅ **SQL Migrations** (D1)
- ✅ **TypeScript Types**
- ✅ **Deployment Config**

### Auto-generated endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/posts` | Create post |
| `GET` | `/posts` | List posts (search, filter, pagination) |
| `GET` | `/posts/:id` | Get post |
| `PUT` | `/posts/:id` | Update post |
| `DELETE` | `/posts/:id` | Delete post |

## 🛠 Development

### Prerequisites

- Node.js 18+
- npm/pnpm
- Cloudflare account (for deployment)

### Setup

```bash
# Clone and install
git clone <repo>
cd edge-baas
npm install

# Build packages
npm run build

# Link CLI globally
npm run link
```

###
# CLI Commands

```bash commands
edge-baas init my-project
edge-baas validate config/*.yaml
edge-baas generate config/api.yaml

# Development
npm run dev

# Build monorepo
npm run build

# Test
npm run test
```

## 📊 Field Types

| Type | SQL | Validation |
|------|-----|------------|
| `string` | `TEXT` | Length constraints |
| `text` | `TEXT` | Length constraints |
| `integer` | `INTEGER` | Min/max |
| `number` | `REAL` | Min/max |
| `boolean` | `INTEGER` | 0/1 |
| `uuid` | `TEXT` | UUID format |
| `email` | `TEXT` | Email format |
| `url` | `TEXT` | URL format |
| `datetime` | `TEXT` | ISO datetime |
| `date` | `TEXT` | YYYY-MM-DD |
| `json` | `TEXT` | JSON object |
| `enum` | `TEXT` | Value list |

## 🏗 Architecture

### Core Components

1. **ConfigParser**: YAML → Object validation
2. **SchemaGenerator**: Object → Zod schemas
3. **EndpointGenerator**: Object → Chanfana endpoints
4. **MigrationGenerator**: Object → SQL migrations
5. **RouterBuilder**: Combine everything

### Generated Output

```
src/
├── generated/
│   ├── blog-api/
│   │   ├── schemas/
│   │   │   ├── posts.ts
│   │   │   └── authors.ts
│   │   ├── endpoints/
│   │   │   ├── create-post.ts
│   │   │   ├── list-posts.ts
│   │   │   └── ...
│   │   ├── migrations/
│   │   │   ├── 001_initial_tables.sql
│   │   │   └── 002_create_posts_table.sql
│   │   └── router.ts
├── index.ts
└── types.ts
```

## 🚢 Deployment

### Cloudflare Workers (Default)

```bash
# Set up database
wrangler d1 create blog-db
wrangler d1 execute blog-db --file=./migrations/001_initial_tables.sql

# Deploy
npm run deploy
```

### Other Platforms

- **Vercel Edge**: Coming soon
- **Deno Deploy**: Coming soon

## 📈 Examples

See `starter/config/` for example configurations:

- `blog.config.yaml` - Blog API
- `ecommerce.config.yaml` - E-commerce API  
- `saas.config.yaml` - Multi-tenant SaaS

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Add tests
4. Submit PR

## 📝 License

MIT

## 🆘 Support

- GitHub Issues
- Documentation: [docs](https://edge-baas.dev)
- Discord: [community](https://discord.gg/edge-baas)