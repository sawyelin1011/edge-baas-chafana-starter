import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { basename, extname } from 'path';
import { ConfigParser } from '@edge-baas/core';
import chalk from 'chalk';

export class ValidateCommand {
  static register(program: Command) {
    program
      .command('validate')
      .description('Validate Edge-BaaS configuration file')
      .argument('[file]', 'Configuration file (config.json, config.yml, or custom with --config)')
      .option('-c, --config <path>', 'Path to configuration file')
      .option('-f, --format <format>', 'Output format', 'text')
      .action((file, options) => ValidateCommand.validateFiles(file, options));
  }

  static async validateFiles(file: string | undefined, options: any) {
    // Determine config file path
    const configPath = options.config || file || this.findDefaultConfig();
    
    if (!configPath) {
      console.log(chalk.red('❌ No configuration file found'));
      console.log(chalk.yellow('   Looking for: config.json, config.yml in ./config/ or current directory'));
      console.log(chalk.blue('   Usage: edge-baas validate [file] or edge-baas validate --config <path>'));
      process.exit(1);
    }

    // Validate file extension
    const ext = extname(configPath);
    if (!['.json', '.yml', '.yaml'].includes(ext)) {
      console.log(chalk.red('❌ Invalid configuration file format'));
      console.log(chalk.yellow(`   Found: ${ext}`));
      console.log(chalk.blue('   Supported formats: .json, .yml, .yaml'));
      process.exit(1);
    }

    if (!existsSync(configPath)) {
      console.log(chalk.red(`❌ File not found: ${configPath}`));
      process.exit(1);
    }

    let allValid = true;
    const results: Array<{ file: string; valid: boolean; errors: string[] }> = [];

    try {
      const content = readFileSync(configPath, 'utf-8');
      const { config, errors } = ConfigParser.parse(content);
      
      results.push({ file: configPath, valid: errors.length === 0, errors });

      if (errors.length === 0) {
        console.log(chalk.green(`✅ ${configPath}`));
        console.log(`   Name: ${config.name}`);
        console.log(`   Resources: ${config.resources.length}`);
        console.log(`   Database: ${config.database?.name || 'Not specified'}`);
      } else {
        console.log(chalk.red(`❌ ${configPath}`));
        errors.forEach(error => {
          console.log(chalk.red(`   ${error}`));
        });
        allValid = false;
      }
      console.log();
    } catch (error) {
      console.log(chalk.red(`❌ ${configPath} - Failed to read`));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      allValid = false;
    }

    if (options.format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    }

    if (allValid) {
      console.log(chalk.green('✅ Configuration is valid!'));
      process.exit(0);
    } else {
      console.log(chalk.red('❌ Validation failed'));
      process.exit(1);
    }
  }

  private static findDefaultConfig(): string | null {
    const possiblePaths = [
      'config/config.json',
      'config/config.yml',
      'config/config.yaml',
      'config.json',
      'config.yml',
      'config.yaml'
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }
}
