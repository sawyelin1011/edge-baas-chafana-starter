import { EdgeBaasConfig, ResourceConfig, GeneratedMigration } from './types.js';

export class MigrationGenerator {
  static generate(config: EdgeBaasConfig): GeneratedMigration[] {
    const migrations: GeneratedMigration[] = [];

    // Generate main table creation migration
    migrations.push(this.generateTableCreationMigration(config));

    // Generate individual table migrations
    for (const resource of config.resources) {
      migrations.push(this.generateResourceMigration(resource));
    }

    // Generate index migrations
    for (const resource of config.resources) {
      if (resource.indexes && resource.indexes.length > 0) {
        migrations.push(this.generateIndexMigration(resource));
      }
    }

    return migrations;
  }

  private static generateTableCreationMigration(config: EdgeBaasConfig): GeneratedMigration {
    const allTables = config.resources.map(resource => this.generateTableSQL(resource)).join('\n\n');
    
    const sql = `-- Create all tables
${allTables}

-- Create indexes
${config.resources
  .filter(resource => resource.indexes)
  .map(resource => 
    resource.indexes!.map(index => 
      `CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX idx_${resource.name}s_${index.fields.join('_')} ON ${resource.name}s (${index.fields.join(', ')});`
    ).join('\n')
  ).join('\n')}
`;

    return {
      name: '001_initial_tables',
      sql
    };
  }

  private static generateResourceMigration(resource: ResourceConfig): GeneratedMigration {
    const tableSQL = this.generateTableSQL(resource);
    
    return {
      name: `002_create_${resource.name}s_table`,
      sql: `-- Create ${resource.name}s table\n${tableSQL}`
    };
  }

  private static generateTableSQL(resource: ResourceConfig): string {
    const fields: string[] = [];

    // Add primary key
    fields.push('  id TEXT PRIMARY KEY');

    // Add user-defined fields
    for (const field of resource.fields) {
      const fieldDef = this.generateFieldSQL(field);
      fields.push(fieldDef);
    }

    // Add timestamps if enabled
    if (resource.timestamps?.createdAt !== false) {
      fields.push('  createdAt TEXT NOT NULL');
    }
    if (resource.timestamps?.updatedAt !== false) {
      fields.push('  updatedAt TEXT NOT NULL');
    }

    // Add foreign key constraints
    for (const field of resource.fields) {
      if (field.relation) {
        const [targetResource] = field.relation.split('.');
        fields.push(`  FOREIGN KEY (${field.name}) REFERENCES ${targetResource}s(id)`);
      }
    }

    return `CREATE TABLE IF NOT EXISTS ${resource.name}s (\n${fields.join(',\n')}\n);`;
  }

  private static generateFieldSQL(field: any): string {
    let sqlType: string;
    let constraints = [];

    switch (field.type) {
      case 'string':
      case 'text':
        sqlType = 'TEXT';
        break;
      case 'integer':
        sqlType = 'INTEGER';
        break;
      case 'number':
        sqlType = 'REAL';
        break;
      case 'boolean':
        sqlType = 'INTEGER'; // SQLite doesn't have native boolean
        break;
      case 'uuid':
      case 'email':
      case 'url':
      case 'datetime':
      case 'date':
        sqlType = 'TEXT';
        break;
      case 'json':
        sqlType = 'TEXT'; // Store JSON as text
        break;
      case 'enum':
        sqlType = 'TEXT';
        break;
      default:
        sqlType = 'TEXT';
    }

    // Add constraints
    if (field.required) {
      constraints.push('NOT NULL');
    }

    if (field.unique) {
      constraints.push('UNIQUE');
    }

    if (field.default !== undefined) {
      if (typeof field.default === 'string') {
        constraints.push(`DEFAULT '${field.default}'`);
      } else {
        constraints.push(`DEFAULT ${field.default}`);
      }
    }

    const constraintStr = constraints.length > 0 ? ' ' + constraints.join(' ') : '';
    return `  ${field.name} ${sqlType}${constraintStr}`;
  }

  private static generateIndexMigration(resource: ResourceConfig): GeneratedMigration {
    if (!resource.indexes || resource.indexes.length === 0) {
      throw new Error(`No indexes defined for resource ${resource.name}`);
    }

    const indexSQLs = resource.indexes.map(index => 
      `CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX idx_${resource.name}s_${index.fields.join('_')} ON ${resource.name}s (${index.fields.join(', ')});`
    ).join('\n');

    return {
      name: `003_create_${resource.name}s_indexes`,
      sql: `-- Create indexes for ${resource.name}s table\n${indexSQLs}`
    };
  }

  // Generate rollback migration
  static generateRollback(config: EdgeBaasConfig): GeneratedMigration {
    const dropTables = config.resources.map(resource => 
      `DROP TABLE IF EXISTS ${resource.name}s;`
    ).join('\n');

    return {
      name: '999_rollback',
      sql: `-- Rollback all tables\n${dropTables}`
    };
  }

  // Generate seed data migration
  static generateSeedMigration(resource: ResourceConfig, seedData: any[]): GeneratedMigration {
    if (!seedData || seedData.length === 0) {
      throw new Error('Seed data is required');
    }

    const values = seedData.map(data => {
      const fields = Object.keys(data).map(key => {
        const value = data[key];
        if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        }
        return value;
      }).join(', ');
      
      return `(${fields})`;
    }).join(',\n    ');

    const sql = `-- Seed data for ${resource.name}s
INSERT INTO ${resource.name}s (${Object.keys(seedData[0]).join(', ')})
VALUES 
    ${values};`;

    return {
      name: `004_seed_${resource.name}s`,
      sql
    };
  }
}