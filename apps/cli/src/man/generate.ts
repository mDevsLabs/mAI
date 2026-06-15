import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { cliVersion, createProgram } from '../program';
import { generateRootManPage } from './roff';

const outputDir = fileURLToPath(new URL('../../man/man1/', import.meta.url));

await mkdir(outputDir, { recursive: true });

const program = createProgram();

await writeFile(`${outputDir}mai.1`, generateRootManPage(program, cliVersion));
