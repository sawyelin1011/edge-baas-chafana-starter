// Edge-BaaS Core Package
export { ConfigParser } from './config-parser.js';
export { SchemaGenerator } from './schema-generator.js';
export { EndpointGenerator } from './endpoint-generator.js';
export { MigrationGenerator } from './migration-generator.js';
export { RouterBuilder } from './router-builder.js';

export type {
  EdgeBaasConfig,
  ResourceConfig,
  FieldConfig,
  GeneratedSchema,
  GeneratedEndpoint,
  GeneratedMigration,
  GenerationResult,
  FieldType
} from './types.js';