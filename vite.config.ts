import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const path = (process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH ?? '/')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  return {
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    plugins: [react(), tailwindcss()],
    base: path ? `/${path}/` : '/',
  };
});
