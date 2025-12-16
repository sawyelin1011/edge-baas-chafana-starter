import yaml from 'js-yaml';
import { z } from 'zod';
import { EdgeBaasConfig, FieldConfig, ResourceConfig, FieldType } from './types.js';

// Field type validation schema
const fieldTypeSchema = z.enum([
  'string', 'text', 'integer', 'number', 'boolean', 
  'uuid', 'email', 'url', 'datetime', 'date', 'json', 'enum'
]);

// Field configuration validation
const fieldConfigSchema = z.object({
  name: z.string().min(1),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  searchable: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  enum: z.array(z.string()).optional(),
  relation: z.string().optional(),
  default: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional()
});

// Resource configuration validation
const resourceConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(fieldConfigSchema).min(1),
  indexes: z.array(z.object({
    fields: z.array(z.string()).min(1),
    unique: z.boolean().optional()
  })).optional(),
  timestamps: z.object({
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).optional()
});

// Main configuration validation
const edgeBaasConfigSchema = z.object({
  name: z.string().min(1),
  version: z.string().optional(),
  description: z.string().optional(),
  database: z.object({
    name: z.string(),
    binding: z.string().optional()
  }).optional(),
  resources: z.array(resourceConfigSchema).min(1)
});

export class ConfigParser {
  static parse(yamlContent: string): { config: EdgeBaasConfig; errors: string[] } {
    try {
      // Parse YAML
      const parsed = yaml.load(yamlContent);
      
      if (!parsed || typeof parsed !== 'object') {
        return {
          config: {} as EdgeBaasConfig,
          errors: ['Invalid YAML: Content must be an object']
        };
      }

      // Validate against schema
      const result = edgeBaasConfigSchema.safeParse(parsed);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return {
          config: {} as EdgeBaasConfig,
          errors
        };
      }

      // Additional validation
      const validationErrors = this.validateConfig(result.data);
      
      return {
        config: result.data,
        errors: validationErrors
      };
    } catch (error) {
      return {
        config: {} as EdgeBaasConfig,
        errors: [`YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  static validate(config: EdgeBaasConfig): { valid: boolean; errors: string[] } {
    const errors = this.validateConfig(config);
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static validateConfig(config: EdgeBaasConfig): string[] {
    const errors: string[] = [];

    // Check resource names for uniqueness
    const resourceNames = new Set<string>();
    for (const resource of config.resources) {
      if (resourceNames.has(resource.name)) {
        errors.push(`Duplicate resource name: ${resource.name}`);
      }
      resourceNames.add(resource.name);

      // Validate field names are unique within resource
      const fieldNames = new Set<string>();
      for (const field of resource.fields) {
        if (fieldNames.has(field.name)) {
          errors.push(`Duplicate field name '${field.name}' in resource '${resource.name}'`);
        }
        fieldNames.add(field.name);

        // Validate enum values if specified
        if (field.type === 'enum' && (!field.enum || field.enum.length === 0)) {
          errors.push(`Field '${field.name}' in resource '${resource.name}' must have enum values`);
        }

        // Validate relation format
        if (field.relation) {
          const [targetResource, targetField] = field.relation.split('.');
          if (!targetResource || !targetField) {
            errors.push(`Invalid relation format '${field.relation}' in field '${field.name}'`);
          } else {
            // Check if target resource exists
            const targetRes = config.resources.find(r => r.name === targetResource);
            if (!targetRes) {
              errors.push(`Target resource '${targetResource}' not found for relation '${field.relation}'`);
            } else {
              // Check if target field exists
              const targetFieldExists = targetRes.fields.find(f => f.name === targetField);
              if (!targetFieldExists) {
                errors.push(`Target field '${targetField}' not found in resource '${targetResource}' for relation '${field.relation}'`);
              }
            }
          }
        }
      }

      // Validate indexes reference existing fields
      if (resource.indexes) {
        for (const index of resource.indexes) {
          for (const fieldName of index.fields) {
            if (!fieldNames.has(fieldName)) {
              errors.push(`Index references non-existent field '${fieldName}' in resource '${resource.name}'`);
            }
          }
        }
      }
    }

    return errors;
  }

  static validateFile(filePath: string): Promise<{ valid: boolean; errors: string[]; config?: EdgeBaasConfig }> {
    return new Promise((resolve) => {
      // This would be implemented to read from filesystem
      // For now, returning a placeholder
      resolve({ valid: false, errors: ['File reading not implemented yet'] });
    });
  }
}