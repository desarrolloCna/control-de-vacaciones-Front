import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const srcDir = 'c:/Users/jcurruchiche/Desktop/VACAS/control-de-vacaciones-Front/src';

function getAllJsFiles(dir) {
  const files = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry === 'node_modules' || entry === '.git') continue;
      const stat = statSync(full);
      if (stat.isDirectory()) {
        files.push(...getAllJsFiles(full));
      } else if (entry.endsWith('.js') || entry.endsWith('.jsx')) {
        files.push(full);
      }
    }
  } catch (e) {}
  return files;
}

const allFiles = getAllJsFiles(srcDir);
const results = [];

for (const file of allFiles) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/from\s+["']([^"']+)["']/);
    if (match) {
      const importPath = match[1];
      if (importPath.startsWith('.') && /[A-Z]/.test(importPath)) {
        results.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    }
  }
}

console.log(results.join('\n'));
