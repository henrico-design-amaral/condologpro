import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://condologpro.henrico.works',
  compressHTML: true,
  build: {
    assets: '_assets'
  }
});
