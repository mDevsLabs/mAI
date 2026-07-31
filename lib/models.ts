import fs from 'fs';
import path from 'path';
import { ModelInfo, modelsData } from './models-data';

export type { ModelInfo };
export { modelsData };

const docsDirectory = path.join(process.cwd(), 'docs');

export function getModels(): ModelInfo[] {
  return modelsData.map((model) => {
    const readmePath = path.join(docsDirectory, model.id, 'README.md');
    let readmeContent = '';
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf8');
    }
    return {
      ...model,
      readmeContent,
    };
  });
}

export function getModelById(id: string): ModelInfo | null {
  const model = modelsData.find((m) => m.id === id);
  if (!model) return null;

  const readmePath = path.join(docsDirectory, model.id, 'README.md');
  let readmeContent = '';
  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  }

  return {
    ...model,
    readmeContent,
  };
}
