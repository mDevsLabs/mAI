import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export function copyChangelogPlugin(): Plugin {
  return {
    name: 'copy-changelog-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/CHANGELOG.md') {
          const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
          if (fs.existsSync(changelogPath)) {
            res.setHeader('Content-Type', 'text/markdown');
            res.end(fs.readFileSync(changelogPath, 'utf-8'));
            return;
          }
        }
        next();
      });
    },
    generateBundle() {
      const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
      if (fs.existsSync(changelogPath)) {
        this.emitFile({
          type: 'asset',
          fileName: 'CHANGELOG.md',
          source: fs.readFileSync(changelogPath, 'utf-8'),
        });
      }
    },
  };
}
