import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';
import { ConfigParser } from '@edge-baas/core';
import chalk from 'chalk';

export class ValidateCommand {
  static register(program: Command) {
    program
      .command('validate')
      .description('Validate Edge-BaaS configuration file')
      .argument('<file>', 'Configuration file (must be config.json)')
      .option('-f, --format <format>', 'Output format', 'text')
      .action((file, options) => ValidateCommand.validateFiles(file, options));
  }

  static async validateFiles(file: string, options: any) {
    // Validate that the file is config.json
    const fileName = basename(file);
    if (fileName !== 'config.json') {
      console.log(chalk.red('❌ Only config.json is supported'));
      console.log(chalk.yellow(`   Found: ${fileName}`));
      console.log(chalk.blue('   Please rename your configuration file to config.json'));
      process.exit(1);
    }

    let allValid = true;
    const results: Array<{ file: string; valid: boolean; errors: string[] }> = [];

    if (!existsSync(file)) {
      console.log(chalk.red(`❌ File not found: ${file}`));
      process.exit(1);
    }

    try {
      const content = readFileSync(file, 'utf-8');
      const { config, errors } = ConfigParser.parse(content);
      
      results.push({ file, valid: errors.length === 0, errors });

      if (errors.length === 0) {
        console.log(chalk.green(`✅ ${file}`));
        console.log(`   Name: ${config.name}`);
        console.log(`   Resources: ${config.resources.length}`);
        console.log(`   Database: ${config.database?.name || 'Not specified'}`);
      } else {
        console.log(chalk.red(`❌ ${file}`));
        errors.forEach(error => {
          console.log(chalk.red(`   ${error}`));
        });
        allValid = false;
      }
      console.log();
    } catch (error) {
      console.log(chalk.red(`❌ ${file} - Failed to read`));
      console.log(chalk.red(`   ${error instanceof Error ? error.message : 'Unknown error'}`));
      allValid = false;
    }

    if (options.format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    }

    if (allValid) {
      console.log(chalk.green('✅ All files are valid!'));
      process.exit(0);
    } else {
      console.log(chalk.red('❌ Validation failed'));
      process.exit(1);
    }
  }
}