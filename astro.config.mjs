import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://condologpro.henrico.works',
  integrations: [preact()],
  compressHTML: true,
  output: 'static',
  build: {
    assets: '_assets',
    format: 'directory'
  },
  vite: {
    build: {
      sourcemap: false,
      target: 'es2022'
    }
  }
});
