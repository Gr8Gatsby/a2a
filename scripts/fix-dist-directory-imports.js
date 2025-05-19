import fs from 'fs';
import path from 'path';

const DIST_DIR = path.join(process.cwd(), 'tatou/dist');
const FILE_REGEX = /\.(js|mjs)$/;
// Matches import/export from '../types' or './types' (not ending with .js/.json/.mjs)
const DIR_IMPORT_REGEX = /(from|require\()\s*(['"])(\.{1,2}\/[a-zA-Z0-9_-]+)(\2)/g;

function fixDirectoryImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  content = content.replace(DIR_IMPORT_REGEX, (match, p1, quote, dirPath) => {
    // Only rewrite if not already ending with .js or .json or .mjs
    if (!dirPath.match(/\.(js|json|mjs)$/)) {
      updated = true;
      return `${p1} ${quote}${dirPath}/index.js${quote}`;
    }
    return match;
  });
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (FILE_REGEX.test(entry.name)) {
      fixDirectoryImports(fullPath);
    }
  }
}

walk(DIST_DIR);
console.log('All directory imports in dist/ now point to index.js'); 