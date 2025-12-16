import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export interface WorkersDeployerOptions {
  accountId?: string;
  route?: string;
  wranglerConfig?: string;
  databaseName?: string;
  databaseBinding?: string;
}

export class WorkersDeployer {
  private options: WorkersDeployerOptions;

  constructor(options: WorkersDeployerOptions = {}) {
    this.options = {
      accountId: options.accountId,
      route: options.route,
      wranglerConfig: options.wranglerConfig,
      databaseName: options.databaseName,
      databaseBinding: options.databaseBinding || 'DB'
    };
  }

  async deploy(projectDir: string, config?: any): Promise<void> {
    console.log(chalk.blue('🚀 Deploying to Cloudflare Workers...'));

    try {
      // Ensure wrangler is installed
      this.ensureWrangler();

      // Setup database if needed
      if (config?.database) {
        await this.setupDatabase(config.database);
      }

      // Deploy the worker
      await this.deployWorker(projectDir);

      console.log(chalk.green('✅ Deployment successful!'));
      console.log(chalk.gray('Your API is now live on Cloudflare Workers'));
    } catch (error) {
      console.log(chalk.red('❌ Deployment failed'));
      throw error;
    }
  }

  async dev(projectDir: string, config?: any): Promise<void> {
    console.log(chalk.blue('🔧 Starting development server...'));

    try {
      this.ensureWrangler();

      // Setup local database if needed
      if (config?.database) {
        await this.setupLocalDatabase(config.database);
      }

      // Start dev server
      console.log(chalk.yellow('Starting wrangler dev server...'));
      execSync('wrangler dev', { 
        cwd: projectDir, 
        stdio: 'inherit' 
      });

    } catch (error) {
      console.log(chalk.red('❌ Development server failed to start'));
      throw error;
    }
  }

  async migrateDatabase(projectDir: string, migrationsDir: string): Promise<void> {
    console.log(chalk.blue('🗄️  Running database migrations...'));

    try {
      this.ensureWrangler();

      // Find all migration files
      const migrationFiles = this.getMigrationFiles(migrationsDir);
      
      for (const migration of migrationFiles) {
        console.log(chalk.gray(`Running migration: ${migration}`));
        execSync(`wrangler d1 execute your-db-name --file="${join(migrationsDir, migration)}"`, {
          cwd: projectDir,
          stdio: 'inherit'
        });
      }

      console.log(chalk.green('✅ Migrations completed successfully'));
    } catch (error) {
      console.log(chalk.red('❌ Migration failed'));
      throw error;
    }
  }

  async seedDatabase(projectDir: string, seedFile: string): Promise<void> {
    console.log(chalk.blue('🌱 Seeding database...'));

    try {
      this.ensureWrangler();

      execSync(`wrangler d1 execute your-db-name --file="${seedFile}"`, {
        cwd: projectDir,
        stdio: 'inherit'
      });

      console.log(chalk.green('✅ Database seeded successfully'));
    } catch (error) {
      console.log(chalk.red('❌ Database seeding failed'));
      throw error;
    }
  }

  private ensureWrangler(): void {
    try {
      execSync('wrangler --version', { stdio: 'pipe' });
    } catch {
      throw new Error('Wrangler is not installed. Please install it with: npm install -g wrangler');
    }
  }

  private async setupDatabase(databaseConfig: any): Promise<void> {
    const databaseName = databaseConfig.name || 'edge-baas-db';

    console.log(chalk.blue(`Setting up database: ${databaseName}`));

    try {
      // Try to create the database (this will fail if it already exists, which is fine)
      execSync(`wrangler d1 create ${databaseName}`, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      console.log(chalk.green(`✅ Database ${databaseName} created`));
    } catch (error) {
      // Database might already exist, which is fine
      console.log(chalk.yellow(`⚠️  Database ${databaseName} may already exist`));
    }
  }

  private async setupLocalDatabase(databaseConfig: any): Promise<void> {
    const databaseName = databaseConfig.name || 'edge-baas-db';

    console.log(chalk.blue(`Setting up local database: ${databaseName}`));

    // For local development, we can use an in-memory or local file database
    const localDbName = `${databaseName}_local`;

    try {
      // Create local database
      execSync(`wrangler d1 create ${localDbName}`, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      console.log(chalk.green(`✅ Local database ${localDbName} created`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Local database ${localDbName} may already exist`));
    }
  }

  private async deployWorker(projectDir: string): Promise<void> {
    const deployCommand = ['wrangler deploy'];
    
    if (this.options.accountId) {
      deployCommand.push(`--account-id=${this.options.accountId}`);
    }
    
    if (this.options.route) {
      deployCommand.push(`--route=${this.options.route}`);
    }

    execSync(deployCommand.join(' '), { 
      cwd: projectDir,
      stdio: 'inherit'
    });
  }

  private getMigrationFiles(migrationsDir: string): string[] {
    if (!existsSync(migrationsDir)) {
      return [];
    }

    // This is a simplified implementation
    // In reality, you'd want to read the directory and filter SQL files
    // and sort them properly
    return ['001_initial_tables.sql'];
  }

  // Generate wrangler.toml configuration
  static generateWranglerConfig(config: any): string {
    const databaseName = config.database?.name || `${config.name}-db`;
    const binding = config.database?.binding || 'DB';

    let config = `name = "${config.name}"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "${binding}"
database_name = "${databaseName}"
database_id = "your-database-id-here"

# Add your Cloudflare account details
# account_id = "your-account-id"
# route = "api.yourdomain.com/*"

# Environment variables
# [env.production.vars]
# ENVIRONMENT = "production"

# [env.staging.vars]
# ENVIRONMENT = "staging"`;

    return config;
  }

  // Validate deployment prerequisites
  static validatePrerequisites(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check if wrangler is installed
    try {
      execSync('wrangler --version', { stdio: 'pipe' });
    } catch {
      issues.push('Wrangler CLI is not installed. Install with: npm install -g wrangler');
    }

    // Check if user is logged in to Cloudflare
    try {
      execSync('wrangler whoami', { stdio: 'pipe' });
    } catch {
      issues.push('Not logged in to Cloudflare. Run: wrangler login');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Get deployment status
  async getDeploymentStatus(): Promise<any> {
    try {
      const output = execSync('wrangler deployments list', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      return JSON.parse(output);
    } catch (error) {
      throw new Error('Failed to get deployment status');
    }
  }
}