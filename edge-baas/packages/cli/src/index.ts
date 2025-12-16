import { Command } from 'commander';
import { InitCommand } from './commands/init.js';
import { ValidateCommand } from './commands/validate.js';
import { GenerateCommand } from './commands/generate.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('edge-baas')
  .description('Edge-BaaS: Generate APIs from YAML configs')
  .version('0.1.0');

// Register commands
InitCommand.register(program);
ValidateCommand.register(program);
GenerateCommand.register(program);

// Add help information
program.addHelpCommand('help', 'Display help information');

// Handle unknown commands
program.on('command:*', (operands) => {
  console.log(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log('Run "edge-baas --help" for available commands.');
  process.exit(1);
});

// Parse command line arguments
program.parse();