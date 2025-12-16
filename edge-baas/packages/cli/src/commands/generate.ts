import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { ConfigParser, RouterBuilder } from '@edge-baas/core';
import chalk from 'chalk';

export class GenerateCommand {
  static register(program: Command) {
    program
      .command('generate')
      .description('Generate API code from configuration files')
      .argument('<files...>', 'Configuration files to generate from')
      .option('-o, --output <dir>', 'Output directory', './src/generated')
      .option('--overwrite', 'Overwrite existing files')
      .action(this.generateCode);
  }

  static async generateCode(files: string[], options: any) {
    if (files.length === 0) {
      console.log(chalk.red('❌ No config files specified'));
      console.log('Usage: edge-baas generate <files...>');
      return;
    }

    const outputDir = options.output;
    
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    for (const file of files) {
      console.log(chalk.blue(`📁 Processing ${file}...`));
      
      try {
        const content = readFileSync(file, 'utf-8');
        const { config, errors } = ConfigParser.parse(content);
        
        if (errors.length > 0) {
          console.log(chalk.red(`❌ Validation failed for ${file}:`));
          errors.forEach(error => {
            console.log(chalk.red(`   ${error}`));
          });
          continue;
        }

        console.log(chalk.green(`✅ ${config.name} - ${config.resources.length} resources`));

        // Generate all code
        const result = RouterBuilder.build(config);

        // Write generated files
        await this.writeGeneratedFiles(config, result, outputDir, options.overwrite);

        console.log(chalk.green(`✅ Generated code for ${config.name}`));
        console.log(`   Schemas: ${result.schemas.length}`);
        console.log(`   Endpoints: ${result.endpoints.length}`);
        console.log(`   Migrations: ${result.migrations.length}`);
        console.log();

      } catch (error) {
        console.log(chalk.red(`❌ Failed to process ${file}`));
        console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }

    // Update main router if needed
    await this.updateMainRouter(outputDir, files.length > 1);

    console.log(chalk.green('🎉 Generation complete!'));
  }

  private static async writeGeneratedFiles(
    config: any, 
    result: any, 
    outputDir: string, 
    overwrite: boolean
  ) {
    const kebabConfigName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const baseDir = join(outputDir, kebabConfigName);

    // Create directory structure
    const dirs = [
      baseDir,
      join(baseDir, 'schemas'),
      join(baseDir, 'endpoints'),
      join(baseDir, 'migrations')
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Write schema files
    for (const schema of result.schemas) {
      const filePath = join(baseDir, 'schemas', `${schema.name}.ts`);
      await this.writeFileIfNotExists(filePath, schema.schema, overwrite);
    }

    // Write endpoint files
    for (const endpoint of result.endpoints) {
      const fileName = this.toKebabCase(endpoint.name);
      const filePath = join(baseDir, 'endpoints', `${fileName}.ts`);
      await this.writeFileIfNotExists(filePath, endpoint.code, overwrite);
    }

    // Write migration files
    for (const migration of result.migrations) {
      const filePath = join(baseDir, 'migrations', `${migration.name}.sql`);
      await this.writeFileIfNotExists(filePath, migration.sql, overwrite);
    }

    // Write router file
    const routerPath = join(baseDir, 'router.ts');
    await this.writeFileIfNotExists(routerPath, result.router, overwrite);

    // Write types file
    const typesPath = join(baseDir, 'types.ts');
    await this.writeFileIfNotExists(typesPath, result.types, overwrite);

    // Write config file (copy of original)
    const configPath = join(baseDir, 'config.yaml');
    await this.writeFileIfNotExists(configPath, config._originalContent || '', overwrite);
  }

  private static async writeFileIfNotExists(filePath: string, content: string, overwrite: boolean) {
    if (!overwrite && existsSync(filePath)) {
      console.log(chalk.yellow(`⚠️  Skipping ${filePath} (already exists)`));
      return;
    }

    writeFileSync(filePath, content);
    console.log(chalk.gray(`  📄 Created ${filePath}`));
  }

  private static async updateMainRouter(outputDir: string, isMultiConfig: boolean) {
    const indexPath = join(outputDir, 'index.ts');
    
    let routerContent = `import { fromHono } from "chanfana";
import { Hono } from "hono";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
`;

    if (isMultiConfig) {
      routerContent += `// Import and register all generated routers
// TODO: Import and register generated endpoints here`;
    } else {
      routerContent += `// Import and register generated endpoints
// TODO: Import and register generated endpoints here`;
    }

    routerContent += `

// Export the Hono app
export default app;`;

    if (!existsSync(indexPath)) {
      writeFileSync(indexPath, routerContent);
      console.log(chalk.gray(`  📄 Created ${indexPath}`));
    }
  }

  private static toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  // Generate specific components
  static async generateSchemas(config: any, outputDir: string) {
    const result = RouterBuilder.build(config);
    
    for (const schema of result.schemas) {
      const filePath = join(outputDir, `${schema.name}.ts`);
      writeFileSync(filePath, schema.schema);
    }
    
    return result.schemas.length;
  }

  static async generateEndpoints(config: any, outputDir: string) {
    const result = RouterBuilder.build(config);
    
    for (const endpoint of result.endpoints) {
      const fileName = this.toKebabCase(endpoint.name);
      const filePath = join(outputDir, `${fileName}.ts`);
      writeFileSync(filePath, endpoint.code);
    }
    
    return result.endpoints.length;
  }

  static async generateMigrations(config: any, outputDir: string) {
    const result = RouterBuilder.build(config);
    
    for (const migration of result.migrations) {
      const filePath = join(outputDir, `${migration.name}.sql`);
      writeFileSync(filePath, migration.sql);
    }
    
    return result.migrations.length;
  }
}