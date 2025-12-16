import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { ConfigParser, RouterBuilder } from '@edge-baas/core';
import { createHash } from 'crypto';
import chalk from 'chalk';

export class GenerateCommand {
  static register(program: Command) {
    program
      .command('generate')
      .description('Generate API code from configuration file')
      .argument('[file]', 'Configuration file (config.json, config.yml, or custom with --config)')
      .option('-c, --config <path>', 'Path to configuration file')
      .option('-o, --output <dir>', 'Output directory', './.output')
      .option('--overwrite', 'Overwrite existing files')
      .option('--force', 'Force regeneration even if config unchanged')
      .action((file, options) => GenerateCommand.generateCode(file, options));
  }

  static async generateCode(file: string | undefined, options: any) {
    // Determine config file path
    const configPath = options.config || file || this.findDefaultConfig();
    
    if (!configPath) {
      console.log(chalk.red('❌ No configuration file found'));
      console.log(chalk.yellow('   Looking for: config.json, config.yml in ./config/ or current directory'));
      console.log(chalk.blue('   Usage: edge-baas generate [file] or edge-baas generate --config <path>'));
      process.exit(1);
    }

    // Validate file extension
    const ext = extname(configPath);
    if (!['.json', '.yml', '.yaml'].includes(ext)) {
      console.log(chalk.red('❌ Invalid configuration file format'));
      console.log(chalk.yellow(`   Found: ${ext}`));
      console.log(chalk.blue('   Supported formats: .json, .yml, .yaml'));
      process.exit(1);
    }

    if (!existsSync(configPath)) {
      console.log(chalk.red(`❌ File not found: ${configPath}`));
      process.exit(1);
    }

    const outputDir = options.output;
    const configFileName = basename(configPath, ext);
    
    console.log(chalk.blue(`📁 Processing ${configPath}...`));
    
    try {
      const content = readFileSync(configPath, 'utf-8');
      const { config, errors } = ConfigParser.parse(content);
      
      if (errors.length > 0) {
        console.log(chalk.red(`❌ Validation failed for ${configPath}:`));
        errors.forEach(error => {
          console.log(chalk.red(`   ${error}`));
        });
        process.exit(1);
      }

      console.log(chalk.green(`✅ ${config.name} - ${config.resources.length} resources`));

      // Check if config has changed
      if (!options.force && !this.hasConfigChanged(content, outputDir)) {
        console.log(chalk.yellow('⏭️  Configuration unchanged, skipping generation'));
        console.log(chalk.gray('   Use --force to regenerate anyway'));
        return;
      }

      // Generate all code
      const result = RouterBuilder.build(config);

      // Write generated files to .output
      await this.writeGeneratedFiles(
        config, 
        result, 
        outputDir, 
        options.overwrite, 
        configPath,
        content,
        configFileName
      );

      console.log(chalk.green(`\n✅ Generated code for ${config.name}`));
      console.log(`   Output: ${outputDir}/`);
      console.log(`   Schemas: ${result.schemas.length}`);
      console.log(`   Endpoints: ${result.endpoints.length}`);
      console.log(`   Migrations: ${result.migrations.length}`);
      console.log();

    } catch (error) {
      console.log(chalk.red(`❌ Failed to process ${configPath}`));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      if (error instanceof Error && error.stack) {
        console.log(chalk.gray(error.stack));
      }
      process.exit(1);
    }

    console.log(chalk.green('🎉 Generation complete!'));
    console.log(chalk.blue(`\nNext steps:`));
    console.log(chalk.gray(`  1. Review generated files in ${outputDir}/`));
    console.log(chalk.gray(`  2. Run migrations: wrangler d1 execute <db> --local --file=${outputDir}/migrations/<migration>.sql`));
    console.log(chalk.gray(`  3. Start dev server: npm run dev`));
  }

  private static findDefaultConfig(): string | null {
    const possiblePaths = [
      'config/config.json',
      'config/config.yml',
      'config/config.yaml',
      'config.json',
      'config.yml',
      'config.yaml'
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }

  private static hasConfigChanged(content: string, outputDir: string): boolean {
    const checksumPath = join(outputDir, '.checksum');
    const newChecksum = createHash('md5').update(content).digest('hex');

    if (!existsSync(checksumPath)) {
      return true;
    }

    const oldChecksum = readFileSync(checksumPath, 'utf-8').trim();
    return oldChecksum !== newChecksum;
  }

  private static saveConfigChecksum(content: string, outputDir: string): void {
    const checksumPath = join(outputDir, '.checksum');
    const checksum = createHash('md5').update(content).digest('hex');
    writeFileSync(checksumPath, checksum);
  }

  private static async writeGeneratedFiles(
    config: any, 
    result: any, 
    outputDir: string, 
    overwrite: boolean,
    originalFile: string,
    originalContent: string,
    configFileName: string
  ) {
    // Create directory structure
    const dirs = [
      outputDir,
      join(outputDir, 'schemas'),
      join(outputDir, 'endpoints'),
      join(outputDir, 'migrations')
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Write .gitkeep to ensure .output folder is tracked
    const gitkeepPath = join(outputDir, '.gitkeep');
    writeFileSync(gitkeepPath, '');

    // Save config checksum
    this.saveConfigChecksum(originalContent, outputDir);

    // Write schema files
    for (const schema of result.schemas) {
      const filePath = join(outputDir, 'schemas', `${schema.name}.ts`);
      await this.writeFileIfNotExists(filePath, schema.schema, overwrite);
    }

    // Write endpoint files
    for (const endpoint of result.endpoints) {
      const fileName = this.toKebabCase(endpoint.name);
      const filePath = join(outputDir, 'endpoints', `${fileName}.ts`);
      await this.writeFileIfNotExists(filePath, endpoint.code, overwrite);
    }

    // Write migration files with config-based naming
    for (const migration of result.migrations) {
      const migrationName = `${migration.name}_${configFileName}`;
      const filePath = join(outputDir, 'migrations', `${migrationName}.sql`);
      await this.writeFileIfNotExists(filePath, migration.sql, overwrite);
    }

    // Write router file
    const routerPath = join(outputDir, 'router.ts');
    await this.writeFileIfNotExists(routerPath, result.router, overwrite);

    // Write types file
    const typesPath = join(outputDir, 'types.ts');
    await this.writeFileIfNotExists(typesPath, result.types, overwrite);

    // Copy original config file
    const configExt = extname(originalFile);
    const configPath = join(outputDir, `config${configExt}`);
    await this.writeFileIfNotExists(configPath, originalContent, overwrite);

    // Generate OpenAPI spec
    const openApiSpec = this.generateOpenAPISpec(config, result);
    const openApiPath = join(outputDir, 'openapi.json');
    await this.writeFileIfNotExists(openApiPath, JSON.stringify(openApiSpec, null, 2), overwrite);

    // Generate metadata file
    const metadata = {
      generatedAt: new Date().toISOString(),
      configFile: originalFile,
      apiName: config.name,
      apiVersion: config.version || '1.0.0',
      resources: config.resources.map((r: any) => r.name),
      outputDir
    };
    const metadataPath = join(outputDir, 'metadata.json');
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private static generateOpenAPISpec(config: any, result: any): any {
    const spec: any = {
      openapi: '3.0.0',
      info: {
        title: config.name,
        version: config.version || '1.0.0',
        description: config.description || `API generated by Edge-BaaS`
      },
      servers: [
        {
          url: 'http://localhost:8787',
          description: 'Development server'
        }
      ],
      paths: {},
      components: {
        schemas: {}
      }
    };

    // Generate paths for each resource
    for (const resource of config.resources) {
      const pluralName = this.pluralize(resource.name);
      const resourcePath = `/${pluralName}`;
      const resourceIdPath = `/${pluralName}/{id}`;
      const resourceName = this.capitalize(resource.name);

      // List endpoint
      spec.paths[resourcePath] = {
        get: {
          summary: `List ${pluralName}`,
          operationId: `list${resourceName}s`,
          tags: [resourceName],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search query' }
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: `#/components/schemas/${resourceName}` } },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: `Create ${resource.name}`,
          operationId: `create${resourceName}`,
          tags: [resourceName],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${resourceName}Create` }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${resourceName}` }
                }
              }
            }
          }
        }
      };

      // Get, Update, Delete endpoints
      spec.paths[resourceIdPath] = {
        get: {
          summary: `Get ${resource.name}`,
          operationId: `get${resourceName}`,
          tags: [resourceName],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${resourceName}` }
                }
              }
            },
            '404': {
              description: 'Not found'
            }
          }
        },
        put: {
          summary: `Update ${resource.name}`,
          operationId: `update${resourceName}`,
          tags: [resourceName],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${resourceName}Update` }
              }
            }
          },
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${resourceName}` }
                }
              }
            },
            '404': {
              description: 'Not found'
            }
          }
        },
        delete: {
          summary: `Delete ${resource.name}`,
          operationId: `delete${resourceName}`,
          tags: [resourceName],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '204': {
              description: 'Deleted'
            },
            '404': {
              description: 'Not found'
            }
          }
        }
      };

      // Add schema definitions
      const properties: any = {};
      const required: string[] = [];
      
      for (const field of resource.fields) {
        properties[field.name] = this.fieldToOpenAPISchema(field);
        if (field.required) {
          required.push(field.name);
        }
      }

      spec.components.schemas[resourceName] = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          ...properties,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      };

      spec.components.schemas[`${resourceName}Create`] = {
        type: 'object',
        required,
        properties
      };

      spec.components.schemas[`${resourceName}Update`] = {
        type: 'object',
        properties
      };
    }

    return spec;
  }

  private static fieldToOpenAPISchema(field: any): any {
    const schema: any = {};

    switch (field.type) {
      case 'string':
      case 'text':
      case 'uuid':
      case 'email':
      case 'url':
      case 'datetime':
      case 'date':
        schema.type = 'string';
        break;
      case 'integer':
        schema.type = 'integer';
        break;
      case 'number':
        schema.type = 'number';
        break;
      case 'boolean':
        schema.type = 'boolean';
        break;
      case 'json':
        schema.type = 'object';
        break;
      case 'enum':
        schema.type = 'string';
        if (field.enum) {
          schema.enum = field.enum;
        }
        break;
      default:
        schema.type = 'string';
    }

    if (field.type === 'email') {
      schema.format = 'email';
    } else if (field.type === 'url') {
      schema.format = 'uri';
    } else if (field.type === 'datetime') {
      schema.format = 'date-time';
    } else if (field.type === 'date') {
      schema.format = 'date';
    } else if (field.type === 'uuid') {
      schema.format = 'uuid';
    }

    if (field.description) {
      schema.description = field.description;
    }

    if (field.min !== undefined) {
      if (field.type === 'string' || field.type === 'text') {
        schema.minLength = field.min;
      } else {
        schema.minimum = field.min;
      }
    }

    if (field.max !== undefined) {
      if (field.type === 'string' || field.type === 'text') {
        schema.maxLength = field.max;
      } else {
        schema.maximum = field.max;
      }
    }

    if (field.default !== undefined) {
      schema.default = field.default;
    }

    return schema;
  }

  private static async writeFileIfNotExists(filePath: string, content: string, overwrite: boolean) {
    if (!overwrite && existsSync(filePath)) {
      console.log(chalk.yellow(`⚠️  Skipping ${filePath} (already exists)`));
      return;
    }

    writeFileSync(filePath, content);
    console.log(chalk.gray(`  📄 Created ${filePath}`));
  }

  private static toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static pluralize(str: string): string {
    // Simple pluralization (can be enhanced with a library if needed)
    if (str.endsWith('s')) return str;
    if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
    if (str.endsWith('ch') || str.endsWith('sh') || str.endsWith('x') || str.endsWith('z')) {
      return str + 'es';
    }
    return str + 's';
  }
}
