import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://henrico-design-amaral.github.io',
  base: '/condologpro',
  compressHTML: true,
  build: {
    assets: '_assets'
  }
});
