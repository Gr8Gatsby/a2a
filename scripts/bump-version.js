import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const type = process.argv[2];
if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('Usage: node scripts/bump-version.js [major|minor|patch]');
  process.exit(1);
}

// Bump root package.json
execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });

// Read the new version from root package.json
const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
const newVersion = rootPackage.version;

// Update tatou/package.json while preserving all fields
const tatouPackagePath = join('tatou', 'package.json');
const tatouPackage = JSON.parse(readFileSync(tatouPackagePath, 'utf8'));

// Create a new package.json with the updated version
const updatedPackage = {
  ...tatouPackage,
  version: newVersion
};

// Write back with preserved formatting
writeFileSync(tatouPackagePath, JSON.stringify(updatedPackage, null, 2) + '\n');

console.log(`✅ Bumped version to ${newVersion} in both package.json files`); 