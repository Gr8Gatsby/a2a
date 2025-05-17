import fs from 'fs';
import path from 'path';

// Ensure tatou directory exists
if (!fs.existsSync('tatou')) {
  fs.mkdirSync('tatou');
}

// Copy README.md to tatou directory
fs.copyFileSync('README.md', 'tatou/README.md');

// Copy types directory if it exists
if (fs.existsSync('src/types')) {
  if (!fs.existsSync('tatou/types')) {
    fs.mkdirSync('tatou/types', { recursive: true });
  }
  fs.cpSync('src/types', 'tatou/types', { recursive: true });
}

console.log('NPM package prepared successfully!'); 