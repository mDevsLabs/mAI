import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'docs', 'en-US');
const ES_DIR = path.join(ROOT_DIR, 'docs', 'es-ES');
const DE_DIR = path.join(ROOT_DIR, 'docs', 'de-DE');

const glossaryEs = `# Glosario

Aquí están las traducciones fijas de algunos términos:

| Clave de desarrollo | zh-CN (Chino) | en-US (Inglés) | es-ES (Español) |
| ------------------- | ------------- | -------------- | --------------- |
| agent               | 助理          | Agent          | Agente          |
| agentGroup          | 群组          | Group          | Grupo           |
| page                | 文稿          | Page           | Página          |
| topic               | 话题          | Topic          | Tema            |
| thread              | 子话题        | Thread         | Hilo            |
`;

const glossaryDe = `# Glossar

Hier sind die festen Übersetzungen bestimmter Begriffe:

| Entwicklungsschlüssel | zh-CN (Chinesisch) | en-US (Englisch) | de-DE (Deutsch) |
| --------------------- | ------------------ | ---------------- | --------------- |
| agent                 | 助理               | Agent            | Agent           |
| agentGroup            | 群组               | Group            | Gruppe          |
| page                  | 文稿               | Page             | Seite           |
| topic                 | 话题               | Topic            | Thema           |
| thread                | 子话题             | Thread           | Thread          |
`;

function copyRecursive(src, dest, locale) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName), locale);
    });
  } else {
    // It's a file
    const ext = path.extname(src);
    if (path.basename(src) === 'glossary.md') {
      const content = locale === 'es' ? glossaryEs : glossaryDe;
      fs.writeFileSync(dest, content, 'utf8');
      return;
    }

    if (ext === '.md' || ext === '.mdx' || ext === '.json') {
      let content = fs.readFileSync(src, 'utf8');
      
      // Let's translate some key headings or patterns if applicable
      if (locale === 'es') {
        content = content
          .replace('# Glossary', '# Glosario')
          .replace('## Getting Started', '## Introducción')
          .replace('## Configuration', '## Configuración');
      } else if (locale === 'de') {
        content = content
          .replace('# Glossary', '# Glossar')
          .replace('## Getting Started', '## Erste Schritte')
          .replace('## Configuration', '## Konfiguration');
      }
      fs.writeFileSync(dest, content, 'utf8');
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

console.log('Duplicating and translating documentation to es-ES and de-DE...');
copyRecursive(SOURCE_DIR, ES_DIR, 'es');
copyRecursive(SOURCE_DIR, DE_DIR, 'de');
console.log('Done!');
