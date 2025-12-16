import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, basename } from 'path';
import { ConfigParser, RouterBuilder } from '@edge-baas/core';
import chalk from 'chalk';

export class GenerateCommand {
  static register(program: Command) {
    program
      .command('generate')
      .description('Generate API code from configuration file')
      .argument('<file>', 'Configuration file (must be config.json)')
      .option('-o, --output <dir>', 'Output directory', './.output')
      .option('--overwrite', 'Overwrite existing files')
      .action((file, options) => GenerateCommand.generateCode(file, options));
  }

  static async generateCode(file: string, options: any) {
    // Validate that the file is config.json
    const fileName = basename(file);
    if (fileName !== 'config.json') {
      console.log(chalk.red('❌ Only config.json is supported'));
      console.log(chalk.yellow(`   Found: ${fileName}`));
      console.log(chalk.blue('   Please rename your configuration file to config.json'));
      process.exit(1);
    }

    if (!existsSync(file)) {
      console.log(chalk.red(`❌ File not found: ${file}`));
      process.exit(1);
    }

    const outputDir = options.output;
    
    console.log(chalk.blue(`📁 Processing ${file}...`));
    
    try {
      const content = readFileSync(file, 'utf-8');
      const { config, errors } = ConfigParser.parse(content);
      
      if (errors.length > 0) {
        console.log(chalk.red(`❌ Validation failed for ${file}:`));
        errors.forEach(error => {
          console.log(chalk.red(`   ${error}`));
        });
        process.exit(1);
      }

      console.log(chalk.green(`✅ ${config.name} - ${config.resources.length} resources`));

      // Generate all code
      const result = RouterBuilder.build(config);

      // Write generated files to .output
      await this.writeGeneratedFiles(config, result, outputDir, options.overwrite, file, content);

      console.log(chalk.green(`\n✅ Generated code for ${config.name}`));
      console.log(`   Output: ${outputDir}/`);
      console.log(`   Schemas: ${result.schemas.length}`);
      console.log(`   Endpoints: ${result.endpoints.length}`);
      console.log(`   Migrations: ${result.migrations.length}`);
      console.log();

    } catch (error) {
      console.log(chalk.red(`❌ Failed to process ${file}`));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }

    console.log(chalk.green('🎉 Generation complete!'));
    console.log(chalk.blue(`\nNext steps:`));
    console.log(chalk.gray(`  1. Review generated files in ${outputDir}/`));
    console.log(chalk.gray(`  2. Run migrations: wrangler d1 execute <db> --file=${outputDir}/migrations/<migration>.sql`));
    console.log(chalk.gray(`  3. Start dev server: npm run dev`));
  }

  private static async writeGeneratedFiles(
    config: any, 
    result: any, 
    outputDir: string, 
    overwrite: boolean,
    originalFile: string,
    originalContent: string
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

    // Write migration files
    for (const migration of result.migrations) {
      const filePath = join(outputDir, 'migrations', `${migration.name}.sql`);
      await this.writeFileIfNotExists(filePath, migration.sql, overwrite);
    }

    // Write router file
    const routerPath = join(outputDir, 'router.ts');
    await this.writeFileIfNotExists(routerPath, result.router, overwrite);

    // Write types file
    const typesPath = join(outputDir, 'types.ts');
    await this.writeFileIfNotExists(typesPath, result.types, overwrite);

    // Copy original config file
    const configPath = join(outputDir, 'config.json');
    await this.writeFileIfNotExists(configPath, originalContent, overwrite);

    // Generate OpenAPI spec
    const openApiSpec = this.generateOpenAPISpec(config, result);
    const openApiPath = join(outputDir, 'openapi.json');
    await this.writeFileIfNotExists(openApiPath, JSON.stringify(openApiSpec, null, 2), overwrite);
  }

  private static generateOpenAPISpec(config: any, result: any): any {
    const spec: any = {
      openapi: '3.0.0',
      info: {
        title: config.name,
        version: config.version || '1.0.0',
        description: config.description || `API generated by Edge-BaaS`
      },
      paths: {},
      components: {
        schemas: {}
      }
    };

    // Generate paths for each resource
    for (const resource of config.resources) {
      const resourcePath = `/${resource.name}s`;
      const resourceIdPath = `/${resource.name}s/{id}`;
      const resourceName = this.capitalize(resource.name);

      // List endpoint
      spec.paths[resourcePath] = {
        get: {
          summary: `List ${resource.name}s`,
          operationId: `list${resourceName}s`,
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'offset', in: 'query', schema: { type: 'integer' } }
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
                      total: { type: 'integer' }
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
            }
          }
        },
        put: {
          summary: `Update ${resource.name}`,
          operationId: `update${resourceName}`,
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
            }
          }
        },
        delete: {
          summary: `Delete ${resource.name}`,
          operationId: `delete${resourceName}`,
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '204': {
              description: 'Deleted'
            }
          }
        }
      };

      // Add schema definitions
      const properties: any = {};
      for (const field of resource.fields) {
        properties[field.name] = this.fieldToOpenAPISchema(field);
      }

      spec.components.schemas[resourceName] = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          ...properties,
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      };

      spec.components.schemas[`${resourceName}Create`] = {
        type: 'object',
        required: resource.fields.filter((f: any) => f.required).map((f: any) => f.name),
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
}
