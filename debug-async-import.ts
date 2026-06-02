const modules = [
  './src/server/routers/async/document.ts',
  './src/server/routers/async/file.ts',
  './src/server/routers/async/image.ts',
  './src/server/routers/async/ragEval.ts',
  './src/server/routers/async/video.ts',
  './src/server/routers/async/index.ts',
];

void (async () => {
  for (const mod of modules) {
    try {
      await import(mod);
      console.log(`ok ${mod}`);
    } catch (error) {
      console.error(`FAIL ${mod}`);
      console.error(error);
      process.exit(1);
    }
  }
})();
