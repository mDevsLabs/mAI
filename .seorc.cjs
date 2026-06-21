// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defineConfig } = require('@lobehub/seo-cli');

module.exports = defineConfig({
  entry: ['./docs/**/*.mdx'],
  modelName: 'gpt-4o-mini',
  experimental: {
    jsonMode: true,
  },
});
