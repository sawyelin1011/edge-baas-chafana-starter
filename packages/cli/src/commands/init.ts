import { Command } from 'commander';
import inquirer from 'inquirer';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export class InitCommand {
  static register(program: Command) {
    program
      .command('init')
      .description('Initialize a new Edge-BaaS project or scaffold a starter config in the current directory')
      .option('-n, --name <name>', 'Project name')
      .option('-d, --dir <dir>', 'Project directory (create full project when provided)')
      .option('-t, --template <template>', 'Starter template to use (blog|ecommerce|saas)', 'blog')
      .action((options) => InitCommand.initProject(options));
  }

  static async initProject(options: any) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: 'my-api',
        when: !options.name
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: 'A new Edge-BaaS API'
      },
      {
        type: 'input',
        name: 'directory',
        message: 'Project directory:',
        default: (answers: any) => answers.name || 'my-api',
        when: false
      },
      {
        type: 'confirm',
        name: 'includeExample',
        message: 'Include example resources?',
        default: true
      }
    ]);

    const projectName = options.name || answers.name;
    const projectDir = options.dir || answers.directory;
    const template = options.template || 'blog';

    // If a directory was provided, preserve the previous behavior (create full project)
    if (options.dir) {
      console.log(`Creating Edge-BaaS project "${projectName}" in ${projectDir}...`);

      // Create project structure
      this.createProjectStructure(projectDir);

      // Create package.json
      this.createPackageJson(projectName, projectDir);

      // Create tsconfig.json
      this.createTsConfig(projectDir);

      // Create wrangler.toml
      this.createWranglerConfig(projectName, projectDir);

      // Create src directory structure
      this.createSourceStructure(projectDir);

      // Create config file
      this.createConfigFile(projectName, projectDir, answers.includeExample);

      // Create README
      this.createReadme(projectName, answers.description, projectDir);

      console.log(`✅ Project created successfully!`);
      console.log(`\nNext steps:`);
      console.log(`  cd ${projectDir}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
      return;
    }

    // Default behavior: write a starter config into the current working directory under ./config
    console.log(`Scaffolding starter config '${template}' into ./config ...`);

    const cwd = process.cwd();
    const configDir = join(cwd, 'config');
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Resolve template file from the monorepo's starter/config folder adjacent to this package
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const templateFile = `${template}.config.yaml`;
    // Try multiple up-level paths to locate the monorepo's starter/config when running from dist
    const candidatePaths = [
      join(__dirname, '../../starter/config', templateFile),
      join(__dirname, '../../../starter/config', templateFile),
      join(__dirname, '../../../../starter/config', templateFile),
      join(__dirname, '../../../../../starter/config', templateFile),
      join(__dirname, '../../../../../..//starter/config', templateFile)
    ];

    let sourcePath: string | null = null;
    for (const p of candidatePaths) {
      if (existsSync(p)) {
        sourcePath = p;
        break;
      }
    }

    if (!sourcePath) {
      // As a fallback, create a minimal config using the answers
      const minimalConfig = `name: ${projectName}\nversion: 1.0.0\ndescription: ${answers.description || ''}\n\ndatabase:\n  name: ${projectName}-db\n  binding: DB\n\nresources:\n  # Add resources here\n`;
      writeFileSync(join(configDir, 'config.json'), minimalConfig);
      console.log('✅ Created minimal config at ./config/config.json');
      console.log('\nNext steps:');
      console.log('  npm install');
      console.log('  edge-baas validate config/config.json');
      console.log('  edge-baas generate config/config.json');
      console.log('  # Run migrations with your platform-specific commands');
      return;
    }

    const destPath = join(configDir, 'config.json');
    const content = readFileSync(sourcePath, 'utf-8');
    writeFileSync(destPath, content);

    console.log(`✅ Starter config written to ./config/config.json (from ${template})`);
    console.log('\nNext steps:');
    console.log('  edge-baas validate config/config.json');
    console.log('  edge-baas generate config/config.json');
    console.log('  # Then run your migration and deploy commands as needed');
  }

  private static createProjectStructure(dir: string) {
    const dirs = [
      dir,
      `${dir}/src`,
      `${dir}/src/generated`,
      `${dir}/src/endpoints`,
      `${dir}/src/schemas`,
      `${dir}/src/migrations`,
      `${dir}/config`,
      `${dir}/migrations`
    ];

    dirs.forEach(d => {
      if (!existsSync(d)) {
        mkdirSync(d, { recursive: true });
      }
    });
  }

  private static createPackageJson(name: string, dir: string) {
    const packageJson = {
      name,
      version: '0.1.0',
      private: true,
      scripts: {
        deploy: 'wrangler deploy',
        dev: 'wrangler dev',
        start: 'wrangler dev',
        'cf-typegen': 'wrangler types',
        build: 'tsc',
        'db:migrate': 'wrangler d1 execute your-db-name --file=./.output/migrations/*.sql',
        'db:seed': 'wrangler d1 execute your-db-name --file=./.output/migrations/*_seed_*.sql',
        validate: 'edge-baas validate config/config.json',
        generate: 'edge-baas generate config/config.json'
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
    };

    writeFileSync(join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));
  }

  private static createTsConfig(dir: string) {
    const tsconfig = {
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
    };

    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  }

  private static createWranglerConfig(name: string, dir: string) {
    const wranglerConfig = `name = "${name}"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "${name}-db"
database_id = "your-database-id-here"

# Add your Cloudflare account details
# account_id = "your-account-id"
# route = "api.yourdomain.com/*"`;

    writeFileSync(join(dir, 'wrangler.toml'), wranglerConfig);
  }

  private static createSourceStructure(dir: string) {
    // Create basic index.ts
    const indexTs = `import { fromHono } from "chanfana";
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
export default app;`;

    writeFileSync(join(dir, 'src/index.ts'), indexTs);

    // Create types.ts
    const typesTs = `// Environment bindings
type Env = { DB: D1Database };

// Generated types will be added here`;
    writeFileSync(join(dir, 'src/types.ts'), typesTs);
  }

  private static createConfigFile(name: string, dir: string, includeExample: boolean) {
    let config = `name: ${name}
version: 1.0.0
description: A new Edge-BaaS API

database:
  name: ${name}-db
  binding: DB

resources:`;

    if (includeExample) {
      config += `
  - name: posts
    description: Blog posts
    fields:
      - name: title
        type: string
        required: true
        min: 3
        searchable: true
      - name: content
        type: text
        required: true
      - name: authorId
        type: uuid
        required: true
        relation: users.id
      - name: published
        type: boolean
        default: false
    indexes:
      - fields: [authorId]
      - fields: [title]
    timestamps:
      createdAt: true
      updatedAt: true

  - name: users
    description: System users
    fields:
      - name: email
        type: email
        required: true
        unique: true
      - name: name
        type: string
        required: true
        min: 2
      - name: avatar
        type: url
    timestamps:
      createdAt: true
      updatedAt: true`;
    }

    writeFileSync(join(dir, 'config', 'config.json'), config);
  }

  private static createReadme(name: string, description: string, dir: string) {
    const readme = `# ${name}

${description}

## Quick Start

1. **Validate your config:**
   \`\`\`bash
   npm run validate
   \`\`\`

2. **Generate your API:**
   \`\`\`bash
   npm run generate
   \`\`\`

3. **Set up your database:**
   \`\`\`bash
   # Create D1 database
   wrangler d1 create ${name}-db

   # Update wrangler.toml with the database ID
   # Then run migrations
   npm run db:migrate
   \`\`\`

4. **Deploy:**
   \`\`\`bash
   npm run dev  # for development
   npm run deploy  # for production
   \`\`\`

## Generated API Endpoints

Your API will have the following endpoints (after generation):

- \`POST /posts\` - Create a new post
- \`GET /posts\` - List posts (with search, filter, pagination)
- \`GET /posts/:id\` - Get a specific post
- \`PUT /posts/:id\` - Update a post
- \`DELETE /posts/:id\` - Delete a post

## Development

### Commands

- \`npm run dev\` - Start development server
- \`npm run validate\` - Validate config files
- \`npm run generate\` - Generate code from config
- \`npm run deploy\` - Deploy to Cloudflare Workers

### Configuration

Edit \`config/api.config.yaml\` to define your resources and fields.

## API Documentation

Once deployed, visit \`/docs\` for interactive API documentation.

## Database Schema

The database schema is automatically generated from your config and includes:

- Primary keys (UUID)
- Foreign key relationships
- Indexes for performance
- Automatic timestamps

## Next Steps

1. Customize your configuration in \`config/api.config.yaml\`
2. Add business logic to generated endpoints
3. Deploy to Cloudflare Workers
4. Set up monitoring and logging`;
    
    writeFileSync(join(dir, 'README.md'), readme);
  }
}