import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const FILE_REGEX = /\.(ts|js)$/;
const IMPORT_EXPORT_REGEX = /(from|require\()(\s*)(['"])(\.{1,2}\/[^'";]+?)(?<!\.js)(\3)/g;

function addJsExtensionToImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  content = content.replace(IMPORT_EXPORT_REGEX, (match, p1, p2, p3, p4) => {
    const lastSegment = p4.split('/').pop();
    if (!p4.endsWith('.js') && lastSegment && lastSegment.includes('.')) {
      updated = true;
      return `${p1}${p2}${p3}${p4}.js${p3}`;
    }
    return match;
  });
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (FILE_REGEX.test(entry.name)) {
      addJsExtensionToImports(fullPath);
    }
  }
}

walk(SRC_DIR);
console.log('All .js extensions added to internal imports/exports in src/.'); 