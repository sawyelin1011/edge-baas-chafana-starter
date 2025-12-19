#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const path = require('path');

const cwd = process.cwd();
const outDir = path.join(cwd, '.output', 'migrations');
const isProd = process.argv.includes('--prod');

function runCmd(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
}

// 1) Generate artifacts
runCmd('node', ['node_modules/@edge-baas/cli/dist/index.js', 'generate']);

// 2) Verify migrations directory (always use .output/migrations)
if (!existsSync(outDir) || readdirSync(outDir).filter(f => f.endsWith('.sql')).length === 0) {
  console.error('No migration files found in .output/migrations');
  console.error('Run: edge-baas generate');
  process.exit(1);
}

console.log(`Found ${readdirSync(outDir).filter(f => f.endsWith('.sql')).length} migration(s) in .output/migrations`);

// 3) Use Wrangler's native migration system for proper tracking & duplicate prevention
const args = ['d1', 'migrations', 'apply', 'edge-baas-db'];
if (!isProd) args.push('--local');

runCmd('wrangler', args);
console.log('Migrations applied (tracked by Wrangler).');
