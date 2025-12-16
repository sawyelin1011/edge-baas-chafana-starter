import { EdgeBaasConfig, ResourceConfig, GeneratedEndpoint } from './types.js';
import { SchemaGenerator } from './schema-generator.js';

export class EndpointGenerator {
  static generate(config: EdgeBaasConfig): GeneratedEndpoint[] {
    const endpoints: GeneratedEndpoint[] = [];

    for (const resource of config.resources) {
      // Generate all CRUD endpoints
      endpoints.push(this.generateCreateEndpoint(resource));
      endpoints.push(this.generateListEndpoint(resource));
      endpoints.push(this.generateGetEndpoint(resource));
      endpoints.push(this.generateUpdateEndpoint(resource));
      endpoints.push(this.generateDeleteEndpoint(resource));
    }

    return endpoints;
  }

  private static generateCreateEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Create${this.capitalize(resource.name)}`;
    const schema = SchemaGenerator.generateRequestSchemas(resource);
    
    const code = `import { D1CreateEndpoint } from 'chanfana';
import { z } from 'zod';
import { ${this.capitalize(resource.name)}Schema, Create${this.capitalize(resource.name)}Schema } from '../schemas/${resource.name}.js';

export class ${className} extends D1CreateEndpoint {
  _meta = { 
    model: { 
      schema: ${this.capitalize(resource.name)}Schema, 
      primaryKeys: ['id'], 
      tableName: '${resource.name}s' 
    } 
  };
  
  dbName = 'DB';

  constructor() {
    super();
  }

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = Create${this.capitalize(resource.name)}Schema.parse(requestData);
    
    // Add default values and timestamps
    const finalData = {
      id: crypto.randomUUID(),
      ...validatedData,
      ${resource.timestamps?.createdAt !== false ? `createdAt: new Date().toISOString(),` : ''}
      ${resource.timestamps?.updatedAt !== false ? `updatedAt: new Date().toISOString(),` : ''}
    };

    return super.handle({
      ...c,
      req: {
        ...c.req,
        json: () => Promise.resolve(finalData)
      }
    } as Context);
  }
}`;

    return {
      name: className,
      code,
      imports: ['D1CreateEndpoint', 'z', this.capitalize(resource.name) + 'Schema', 'Create' + this.capitalize(resource.name) + 'Schema']
    };
  }

  private static generateListEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `List${this.capitalize(resource.name)}s`;
    const schema = SchemaGenerator.generateRequestSchemas(resource);
    
    const searchableFields = resource.fields.filter(f => f.searchable).map(f => f.name);
    const filterableFields = resource.fields.filter(f => f.type === 'boolean' || f.type === 'enum').map(f => f.name);

    const code = `import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { ${this.capitalize(resource.name)}Schema } from '../schemas/${resource.name}.js';
import { ${this.capitalize(resource.name)}QuerySchema } from '../schemas/${resource.name}.js';

export class ${className} extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: ${this.capitalize(resource.name)}Schema, 
      primaryKeys: ['id'], 
      tableName: '${resource.name}s' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = [${filterableFields.map(f => `'${f}'`).join(', ')}];
  searchFields = [${searchableFields.map(f => `'${f}'`).join(', ')}];
  orderByFields = [${resource.fields.filter(f => f.type === 'datetime' || f.type === 'date').map(f => `'${f.name}'`).join(', ')}];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = ${this.capitalize(resource.name)}QuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}`;

    return {
      name: className,
      code,
      imports: ['D1ListEndpoint', 'z', this.capitalize(resource.name) + 'Schema', this.capitalize(resource.name) + 'QuerySchema']
    };
  }

  private static generateGetEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Get${this.capitalize(resource.name)}`;
    
    const code = `import { D1ReadEndpoint } from 'chanfana';
import { z } from 'zod';
import { ${this.capitalize(resource.name)}Schema } from '../schemas/${resource.name}.js';

export class ${className} extends D1ReadEndpoint {
  _meta = { 
    model: { 
      schema: ${this.capitalize(resource.name)}Schema, 
      primaryKeys: ['id'], 
      tableName: '${resource.name}s' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}`;

    return {
      name: className,
      code,
      imports: ['D1ReadEndpoint', 'z', this.capitalize(resource.name) + 'Schema']
    };
  }

  private static generateUpdateEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Update${this.capitalize(resource.name)}`;
    const schema = SchemaGenerator.generateRequestSchemas(resource);
    
    const code = `import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { ${this.capitalize(resource.name)}Schema, Update${this.capitalize(resource.name)}RequestSchema } from '../schemas/${resource.name}.js';

export class ${className} extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: ${this.capitalize(resource.name)}Schema, 
      primaryKeys: ['id'], 
      tableName: '${resource.name}s' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = Update${this.capitalize(resource.name)}RequestSchema.parse(requestData);
    
    // Add updated timestamp
    const finalData = {
      ...validatedData,
      ${resource.timestamps?.updatedAt !== false ? `updatedAt: new Date().toISOString(),` : ''}
    };

    return super.handle({
      ...c,
      req: {
        ...c.req,
        json: () => Promise.resolve(finalData)
      }
    } as Context);
  }
}`;

    return {
      name: className,
      code,
      imports: ['D1UpdateEndpoint', 'z', this.capitalize(resource.name) + 'Schema', 'Update' + this.capitalize(resource.name) + 'RequestSchema']
    };
  }

  private static generateDeleteEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Delete${this.capitalize(resource.name)}`;
    
    const code = `import { D1DeleteEndpoint } from 'chanfana';
import { z } from 'zod';
import { ${this.capitalize(resource.name)}Schema } from '../schemas/${resource.name}.js';

export class ${className} extends D1DeleteEndpoint {
  _meta = { 
    model: { 
      schema: ${this.capitalize(resource.name)}Schema, 
      primaryKeys: ['id'], 
      tableName: '${resource.name}s' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}`;

    return {
      name: className,
      code,
      imports: ['D1DeleteEndpoint', 'z', this.capitalize(resource.name) + 'Schema']
    };
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}