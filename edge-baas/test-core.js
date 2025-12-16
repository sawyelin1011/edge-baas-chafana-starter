import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigParser, RouterBuilder } from '../packages/core/src/index.js';

const configPath = join(process.cwd(), 'starter', 'config', 'blog.config.yaml');

console.log('🔍 Testing Edge-BaaS Core...');

try {
  // Read config file
  const configContent = readFileSync(configPath, 'utf-8');
  console.log(`✅ Read config file: ${configPath}`);

  // Parse and validate
  const { config, errors } = ConfigParser.parse(configContent);
  
  if (errors.length > 0) {
    console.log('❌ Validation errors:');
    errors.forEach(error => console.log(`  ${error}`));
    process.exit(1);
  }

  console.log(`✅ Config parsed successfully`);
  console.log(`   Name: ${config.name}`);
  console.log(`   Resources: ${config.resources.length}`);

  // Generate code
  console.log('\n🛠 Generating code...');
  const result = RouterBuilder.build(config);

  console.log(`✅ Generated:`);
  console.log(`   Schemas: ${result.schemas.length}`);
  console.log(`   Endpoints: ${result.endpoints.length}`);
  console.log(`   Migrations: ${result.migrations.length}`);

  // Show generated schema example
  if (result.schemas.length > 0) {
    console.log('\n📄 Generated schema example (first 300 chars):');
    console.log(result.schemas[0].schema.substring(0, 300) + '...');
  }

  // Show generated migration example
  if (result.migrations.length > 0) {
    console.log('\n🗄️ Generated migration example (first 300 chars):');
    console.log(result.migrations[0].sql.substring(0, 300) + '...');
  }

  console.log('\n🎉 Edge-BaaS core is working correctly!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}