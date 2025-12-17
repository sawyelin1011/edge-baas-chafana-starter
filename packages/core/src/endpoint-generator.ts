import { EdgeBaasConfig, ResourceConfig, GeneratedEndpoint } from './types.js';

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
    
    const code = `import { D1CreateEndpoint } from 'chanfana';
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
}`;

    return {
      name: className,
      code,
      imports: ['D1CreateEndpoint', this.capitalize(resource.name) + 'Schema', 'Create' + this.capitalize(resource.name) + 'Schema']
    };
  }

  private static generateListEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `List${this.capitalize(resource.name)}s`;
    
    const searchableFields = resource.fields.filter(f => f.searchable).map(f => f.name);
    const filterableFields = resource.fields.filter(f => f.type === 'boolean' || f.type === 'enum').map(f => f.name);

    const code = `import { D1ListEndpoint } from 'chanfana';
import { ${this.capitalize(resource.name)}Schema, ${this.capitalize(resource.name)}QuerySchema } from '../schemas/${resource.name}.js';

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
}`;

    return {
      name: className,
      code,
      imports: ['D1ListEndpoint', this.capitalize(resource.name) + 'Schema', this.capitalize(resource.name) + 'QuerySchema']
    };
  }

  private static generateGetEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Get${this.capitalize(resource.name)}`;
    
    const code = `import { D1ReadEndpoint } from 'chanfana';
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
}`;

    return {
      name: className,
      code,
      imports: ['D1ReadEndpoint', this.capitalize(resource.name) + 'Schema']
    };
  }

  private static generateUpdateEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Update${this.capitalize(resource.name)}`;
    
    const code = `import { D1UpdateEndpoint } from 'chanfana';
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
}`;

    return {
      name: className,
      code,
      imports: ['D1UpdateEndpoint', this.capitalize(resource.name) + 'Schema', 'Update' + this.capitalize(resource.name) + 'RequestSchema']
    };
  }

  private static generateDeleteEndpoint(resource: ResourceConfig): GeneratedEndpoint {
    const className = `Delete${this.capitalize(resource.name)}`;
    
    const code = `import { D1DeleteEndpoint } from 'chanfana';
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
}`;

    return {
      name: className,
      code,
      imports: ['D1DeleteEndpoint', this.capitalize(resource.name) + 'Schema']
    };
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}