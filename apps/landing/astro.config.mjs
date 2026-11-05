import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Static site: `astro build` writes ./dist, served by Workers static assets (wrangler.jsonc).
export default defineConfig({
  site: 'https://fullstack-template-landing.YOUR-SUBDOMAIN.workers.dev',
  vite: { plugins: [tailwindcss()] },
});
