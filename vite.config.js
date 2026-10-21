import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
export default defineConfig({plugins:[tailwindcss()],build:{rollupOptions:{input:{home:resolve('index.html'),solutions:resolve('solutions/index.html'),projects:resolve('projects/index.html'),services:resolve('services/index.html'),about:resolve('about/index.html'),sitemap:resolve('sitemap/index.html')}}}});
