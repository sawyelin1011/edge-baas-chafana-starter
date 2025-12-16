import { EdgeBaasConfig, GenerationResult } from './types.js';
import { SchemaGenerator } from './schema-generator.js';
import { EndpointGenerator } from './endpoint-generator.js';
import { MigrationGenerator } from './migration-generator.js';

export class RouterBuilder {
  static build(config: EdgeBaasConfig): GenerationResult {
    // Generate schemas
    const schemas = SchemaGenerator.generate(config);

    // Generate endpoints
    const endpoints = EndpointGenerator.generate(config);

    // Generate migrations
    const migrations = MigrationGenerator.generate(config);

    // Generate router
    const router = this.generateRouter(config, endpoints);

    // Generate types
    const types = this.generateTypes(config, schemas);

    return {
      schemas,
      endpoints,
      migrations,
      router,
      types
    };
  }

  private static generateRouter(config: EdgeBaasConfig, endpoints: any[]): string {
    const imports = [
      `import { fromHono } from 'chanfana';`,
      `import { Hono } from 'hono';`,
      ...endpoints.map(ep => `import { ${ep.name} } from './endpoints/${this.toKebabCase(ep.name)}';`)
    ].join('\n');

    const endpointRegistrations = config.resources.flatMap(resource => {
      const resourceName = resource.name;
      const className = this.capitalize(resourceName);
      
      return [
        `openapi.post('/${resourceName}s', Create${className});`,
        `openapi.get('/${resourceName}s', List${className}s);`,
        `openapi.get('/${resourceName}s/:id', Get${className});`,
        `openapi.put('/${resourceName}s/:id', Update${className});`,
        `openapi.delete('/${resourceName}s/:id', Delete${className});`
      ];
    }).join('\n    ');

    const routerCode = `${imports}

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
${endpointRegistrations}

// Export the Hono app
export default app;`;

    return routerCode;
  }

  private static generateTypes(config: EdgeBaasConfig, schemas: any[]): string {
    const typeExports = schemas.map(schema => 
      schema.typeExports.join('\n')
    ).join('\n\n');

    const envType = `type Env = { DB: D1Database };`;

    return `${envType}

${typeExports}

// Combined type for all resources
export type Resources = {
${config.resources.map(r => `  ${r.name}: ${this.capitalize(r.name)};`).join('\n')}
};`;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  // Generate configuration file (wrangler.toml)
  static generateWranglerConfig(config: EdgeBaasConfig): string {
    const databaseName = config.database?.name || `${config.name}-db`;
    const binding = config.database?.binding || 'DB';

    return `name = "${config.name}"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "${binding}"
database_name = "${databaseName}"
database_id = "your-database-id-here"

# Add your Cloudflare account details
# account_id = "your-account-id"
# route = "api.yourdomain.com/*"`;
  }

  // Generate package.json for the generated project
  static generatePackageJson(config: EdgeBaasConfig): string {
    return JSON.stringify({
      name: config.name,
      version: config.version || '0.1.0',
      private: true,
      scripts: {
        deploy: 'wrangler deploy',
        dev: 'wrangler dev',
        start: 'wrangler dev',
        'cf-typegen': 'wrangler types',
        build: 'tsc',
        'db:migrate': 'wrangler d1 execute your-db-name --file=./migrations/001_initial_tables.sql',
        'db:seed': 'wrangler d1 execute your-db-name --file=./migrations/004_seed_data.sql'
      },
      dependencies: {
        'chanfana': '^2.6.3',
        'hono': '^4.6.20',
        'zod': '^3.24.1'
      },
      devDependencies: {
        '@types/node': '^22.13.0',
        '@types/service-worker-mock': '^2.0.4',
        'typescript': '^5.6.0',
        'wrangler': '^4.55.0'
      }
    }, null, 2);
  }

  // Generate tsconfig.json
  static generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        types: ['@cloudflare/workers-types']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    }, null, 2);
  }
}