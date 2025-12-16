import { z } from 'zod';
import { EdgeBaasConfig, ResourceConfig, FieldConfig, GeneratedSchema } from './types.js';

export class SchemaGenerator {
  static generate(config: EdgeBaasConfig): GeneratedSchema[] {
    return config.resources.map(resource => this.generateResourceSchema(resource));
  }

  private static generateResourceSchema(resource: ResourceConfig): GeneratedSchema {
    const zodFields: string[] = [];
    const typeExports: string[] = [];

    // Generate Zod schema for each field
    for (const field of resource.fields) {
      const zodField = this.generateFieldSchema(field);
      zodFields.push(`  ${field.name}: ${zodField}${field.required === false ? '.optional()' : ''}`);
    }

    // Add timestamps if enabled
    if (resource.timestamps?.createdAt !== false) {
      zodFields.push(`  createdAt: z.string().datetime()`);
    }
    if (resource.timestamps?.updatedAt !== false) {
      zodFields.push(`  updatedAt: z.string().datetime()`);
    }

    // Generate the complete schema
    const schemaCode = `export const ${this.capitalize(resource.name)}Schema = z.object({\n${zodFields.join(',\n')}\n});`;

    // Generate TypeScript type export
    const typeCode = `export type ${this.capitalize(resource.name)} = z.infer<typeof ${this.capitalize(resource.name)}Schema>;`;
    
    // Add to type exports
    typeExports.push(typeCode);

    // Generate creation schema (without auto-generated fields)
    const createSchemaFields = resource.fields
      .filter(field => !field.name.match(/^(id|createdAt|updatedAt)$/))
      .map(field => {
        const zodField = this.generateFieldSchema(field);
        return `  ${field.name}: ${zodField}${field.required === false ? '.optional()' : ''}`;
      });

    const createSchemaCode = `export const Create${this.capitalize(resource.name)}Schema = z.object({\n${createSchemaFields.join(',\n')}\n});`;
    const createTypeCode = `export type Create${this.capitalize(resource.name)} = z.infer<typeof Create${this.capitalize(resource.name)}Schema>;`;

    typeExports.push(createSchemaCode, createTypeCode);

    return {
      name: resource.name,
      schema: [schemaCode, ...typeExports].join('\n\n'),
      typeExports
    };
  }

  private static generateFieldSchema(field: FieldConfig): string {
    switch (field.type) {
      case 'string':
        return `z.string()${this.addStringConstraints(field)}`;
      
      case 'text':
        return `z.string()${this.addStringConstraints(field)}`;
      
      case 'integer':
        return `z.number().int()${this.addNumberConstraints(field)}`;
      
      case 'number':
        return `z.number()${this.addNumberConstraints(field)}`;
      
      case 'boolean':
        return `z.boolean()`;
      
      case 'uuid':
        return `z.string().uuid()`;
      
      case 'email':
        return `z.string().email()`;
      
      case 'url':
        return `z.string().url()`;
      
      case 'datetime':
        return `z.string().datetime()`;
      
      case 'date':
        return `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`;
      
      case 'json':
        return `z.record(z.any())`;
      
      case 'enum':
        if (!field.enum || field.enum.length === 0) {
          throw new Error(`Enum field '${field.name}' must have enum values`);
        }
        return `z.enum([${field.enum.map(v => `'${v}'`).join(', ')}])`;
      
      default:
        throw new Error(`Unsupported field type: ${field.type}`);
    }
  }

  private static addStringConstraints(field: FieldConfig): string {
    let constraints = '';
    
    if (field.min !== undefined) {
      constraints += `.min(${field.min})`;
    }
    
    if (field.max !== undefined) {
      constraints += `.max(${field.max})`;
    }
    
    return constraints;
  }

  private static addNumberConstraints(field: FieldConfig): string {
    let constraints = '';
    
    if (field.min !== undefined) {
      constraints += `.min(${field.min})`;
    }
    
    if (field.max !== undefined) {
      constraints += `.max(${field.max})`;
    }
    
    return constraints;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Generate validation schema for API requests
  static generateRequestSchemas(resource: ResourceConfig): {
    create: string;
    update: string;
    query: string;
  } {
    const createFields = resource.fields
      .filter(field => !field.name.match(/^(id|createdAt|updatedAt)$/))
      .map(field => {
        const zodField = this.generateFieldSchema(field);
        return `  ${field.name}: ${zodField}${field.required === false ? '.optional()' : ''}`;
      });

    const createSchema = `export const Create${this.capitalize(resource.name)}RequestSchema = z.object({\n${createFields.join(',\n')}\n});`;

    const updateFields = resource.fields
      .filter(field => !field.name.match(/^(id|createdAt|updatedAt)$/))
      .map(field => {
        const zodField = this.generateFieldSchema(field);
        return `  ${field.name}: ${zodField}.optional()`;
      });

    const updateSchema = `export const Update${this.capitalize(resource.name)}RequestSchema = z.object({\n${updateFields.join(',\n')}\n});`;

    // Generate query schema with common parameters
    const querySchema = `export const ${this.capitalize(resource.name)}QuerySchema = z.object({
  limit: z.number().min(1).max(100).default(10).optional(),
  offset: z.number().min(0).default(0).optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('asc').optional(),
  search: z.string().optional(),
  ${resource.fields.filter(f => f.searchable || f.type === 'boolean' || f.type === 'enum').map(f => 
    `${f.name}: z.string().optional()`
  ).join(',\n  ')}
});`;

    return {
      create: createSchema,
      update: updateSchema,
      query: querySchema
    };
  }
}