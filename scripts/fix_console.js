const fs = require('fs');
const files = [
  'scripts/serverLauncher/startServer.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/console\.log\(/g, 'console.info(');
    content = content.replace(/console\.error\(/g, 'console.info('); 
    fs.writeFileSync(file, content);
  }
}
console.log('Done');
