import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), tailwindcss(), reactRouter()],
  resolve: { tsconfigPaths: true },
  // host: reachable from phones on the same Wi-Fi (mobile calls /api here in dev).
  server: { host: true, port: 5173 },
  preview: { host: true },
});
