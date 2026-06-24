const fs = require('fs');
const path = require('path');

const EXCLUDED_PATTERNS = [
  /@lobehub\//,            // NPM scopes
  /github\.com\/lobehub/, // GitHub URLs
  /lobehub\.com/,         // Domains
];

function replaceInText(text) {
  // Regex that matches LobeHub/LobeAI but not if preceded by @ or followed by / or .com
  // We can use a replacer function to check context.
  
  return text.replace(/LobeHub|LobeAI/g, (match, offset, string) => {
    // Check surrounding 20 chars to see if it matches any excluded pattern
    const start = Math.max(0, offset - 20);
    const end = Math.min(string.length, offset + 20);
    const context = string.substring(start, end);
    
    for (const pattern of EXCLUDED_PATTERNS) {
      if (pattern.test(context)) {
        return match; // Do not replace
      }
    }
    
    if (match === 'LobeHub') return 'mAI';
    if (match === 'LobeAI') return 'May';
    return match;
  });
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.md') || fullPath.endsWith('.mdx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replaceInText(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

// Process docs/
if (fs.existsSync('docs')) {
  processDirectory('docs');
}

// Process root READMEs
const rootFiles = fs.readdirSync('.');
for (const file of rootFiles) {
  if (file.startsWith('README') && file.endsWith('.md')) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = replaceInText(content);
    if (content !== newContent) {
      fs.writeFileSync(file, newContent);
    }
  }
}

console.log('Documentation replacement complete.');
