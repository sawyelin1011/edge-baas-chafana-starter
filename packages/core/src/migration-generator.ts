import { EdgeBaasConfig, ResourceConfig, GeneratedMigration } from './types.js';
import { createHash } from 'crypto';

export class MigrationGenerator {
  private static generatedTimestamps = new Set<string>();

  static generate(config: EdgeBaasConfig): GeneratedMigration[] {
    const migrations: GeneratedMigration[] = [];
    this.generatedTimestamps.clear();

    // Generate individual table migrations
    for (const resource of config.resources) {
      const migration = this.generateResourceMigration(resource);
      migrations.push(migration);
    }

    // Generate index migrations
    for (const resource of config.resources) {
      if (resource.indexes && resource.indexes.length > 0) {
        const migration = this.generateIndexMigration(resource);
        migrations.push(migration);
      }
    }

    return migrations;
  }

  private static generateTimestamp(): string {
    let timestamp: string;
    let attempts = 0;
    
    do {
      const now = new Date();
      // Format: YYYYMMDDHHMM
      timestamp = now.toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 12);
      
      // If timestamp already used, wait 1ms and try again
      if (this.generatedTimestamps.has(timestamp)) {
        attempts++;
        if (attempts > 100) {
          // Fallback: add milliseconds to make it unique
          const ms = now.getMilliseconds().toString().padStart(3, '0');
          timestamp = timestamp + ms.slice(0, 2);
          break;
        }
        // Small delay to ensure different timestamp
        const waitUntil = Date.now() + 1;
        while (Date.now() < waitUntil) { /* busy wait */ }
        continue;
      }
      break;
    } while (true);

    this.generatedTimestamps.add(timestamp);
    return timestamp;
  }

  private static calculateChecksum(sql: string): string {
    return createHash('md5').update(sql).digest('hex');
  }

  private static generateResourceMigration(resource: ResourceConfig): GeneratedMigration {
    const tableSQL = this.generateTableSQL(resource);
    const sql = `-- Create ${resource.name}s table\n${tableSQL}`;
    const timestamp = this.generateTimestamp();
    
    return {
      name: `${timestamp}_${resource.name}_create_table`,
      sql,
      checksum: this.calculateChecksum(sql)
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
      `CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS idx_${resource.name}s_${index.fields.join('_')} ON ${resource.name}s (${index.fields.join(', ')});`
    ).join('\n');

    const sql = `-- Create indexes for ${resource.name}s table\n${indexSQLs}`;
    const timestamp = this.generateTimestamp();

    return {
      name: `${timestamp}_${resource.name}_create_indexes`,
      sql,
      checksum: this.calculateChecksum(sql)
    };
  }

  // Generate rollback migration
  static generateRollback(config: EdgeBaasConfig): GeneratedMigration {
    const dropTables = config.resources.map(resource => 
      `DROP TABLE IF EXISTS ${resource.name}s;`
    ).join('\n');

    const sql = `-- Rollback all tables\n${dropTables}`;
    const timestamp = this.generateTimestamp();

    return {
      name: `${timestamp}_rollback`,
      sql,
      checksum: this.calculateChecksum(sql)
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

    const timestamp = this.generateTimestamp();

    return {
      name: `${timestamp}_seed_${resource.name}s`,
      sql,
      checksum: this.calculateChecksum(sql)
    };
  }
}
