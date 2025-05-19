import fs from 'fs';
import path from 'path';

// Ensure tatou directory exists
if (!fs.existsSync('tatou')) {
  fs.mkdirSync('tatou');
}

// Copy README.md to tatou directory
fs.copyFileSync('README.md', 'tatou/README.md');

console.log('NPM package prepared successfully!'); 