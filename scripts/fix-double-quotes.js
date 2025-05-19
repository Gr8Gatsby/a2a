import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const FILE_REGEX = /\.(ts|js)$/;
// Matches .js'' or .js""
const DOUBLE_QUOTE_REGEX = /(\.js)(['"])\2/g;

function fixDoubleQuotes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  content = content.replace(DOUBLE_QUOTE_REGEX, (match, ext, quote) => {
    updated = true;
    return `${ext}${quote}`;
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
      fixDoubleQuotes(fullPath);
    }
  }
}

walk(SRC_DIR);
console.log('All double quotes after .js extensions fixed in src/.'); 