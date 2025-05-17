import { execSync } from 'child_process';

const type = process.argv[2];
if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('Usage: node scripts/bump-version.js [major|minor|patch]');
  process.exit(1);
}

execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' }); 