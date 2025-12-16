# my-api

A new Edge-BaaS API

## Quick Start

1. **Validate your config:**
   ```bash
   npm run validate
   ```

2. **Generate your API:**
   ```bash
   npm run generate
   ```

3. **Set up your database:**
   ```bash
   # Create D1 database
   wrangler d1 create my-api-db

   # Update wrangler.toml with the database ID
   # Then run migrations
   npm run db:migrate
   ```

4. **Deploy:**
   ```bash
   npm run dev  # for development
   npm run deploy  # for production
   ```

## Generated API Endpoints

Your API will have the following endpoints (after generation):

- `POST /posts` - Create a new post
- `GET /posts` - List posts (with search, filter, pagination)
- `GET /posts/:id` - Get a specific post
- `PUT /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

## Development

### Commands

- `npm run dev` - Start development server
- `npm run validate` - Validate config files
- `npm run generate` - Generate code from config
- `npm run deploy` - Deploy to Cloudflare Workers

### Configuration

Edit `config/api.config.yaml` to define your resources and fields.

## API Documentation

Once deployed, visit `/docs` for interactive API documentation.

## Database Schema

The database schema is automatically generated from your config and includes:

- Primary keys (UUID)
- Foreign key relationships
- Indexes for performance
- Automatic timestamps

## Next Steps

1. Customize your configuration in `config/api.config.yaml`
2. Add business logic to generated endpoints
3. Deploy to Cloudflare Workers
4. Set up monitoring and logging