import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { ConfigParser } from '@edge-baas/core';
import chalk from 'chalk';

export class ValidateCommand {
  static register(program: Command) {
    program
      .command('validate')
      .description('Validate Edge-BaaS configuration files')
      .argument('[files...]', 'Configuration files to validate')
      .option('-f, --format <format>', 'Output format', 'text')
      .action(this.validateFiles);
  }

  static async validateFiles(files: string[], options: any) {
    if (files.length === 0) {
      console.log(chalk.red('❌ No files specified'));
      console.log('Usage: edge-baas validate <files...>');
      return;
    }

    let allValid = true;
    const results: Array<{ file: string; valid: boolean; errors: string[] }> = [];

    for (const file of files) {
      if (!existsSync(file)) {
        console.log(chalk.red(`❌ File not found: ${file}`));
        allValid = false;
        continue;
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