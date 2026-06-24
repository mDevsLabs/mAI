const fs = require('fs');

function fixEmptyMapping(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/:\s*$/) && !lines[i].trim().startsWith('#')) {
      lines[i] = lines[i] + ' null';
    }
  }
  fs.writeFileSync(filePath, lines.join('\n'));
}

fixEmptyMapping('docker-compose/dev/searxng-settings.yml');
fixEmptyMapping('docker-compose/production/grafana/searxng-settings.yml');
console.log('Done');
