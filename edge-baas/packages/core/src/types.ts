// Core types for Edge-BaaS configuration

export type FieldType = 
  | 'string' 
  | 'text' 
  | 'integer' 
  | 'number' 
  | 'boolean' 
  | 'uuid' 
  | 'email' 
  | 'url' 
  | 'datetime' 
  | 'date' 
  | 'json' 
  | 'enum';

export interface FieldConfig {
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  searchable?: boolean;
  min?: number;
  max?: number;
  enum?: string[];
  relation?: string; // format: "resource.field"
  default?: string | number | boolean | null;
}

export interface IndexConfig {
  fields: string[];
  unique?: boolean;
}

export interface ResourceConfig {
  name: string;
  description?: string;
  fields: FieldConfig[];
  indexes?: IndexConfig[];
  timestamps?: {
    createdAt?: boolean;
    updatedAt?: boolean;
  };
}

export interface DatabaseConfig {
  name: string;
  binding?: string;
}

export interface EdgeBaasConfig {
  name: string;
  version?: string;
  description?: string;
  database?: DatabaseConfig;
  resources: ResourceConfig[];
}

// Generated code types
export interface GeneratedEndpoint {
  name: string;
  code: string;
  imports: string[];
}

export interface GeneratedSchema {
  name: string;
  schema: string;
  typeExports: string[];
}

export interface GeneratedMigration {
  name: string;
  sql: string;
}

export interface GenerationResult {
  schemas: GeneratedSchema[];
  endpoints: GeneratedEndpoint[];
  migrations: GeneratedMigration[];
  router: string;
  types: string;
}