import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {resolve} from 'node:path';
export default defineConfig({plugins:[tailwindcss()],build:{sourcemap:false,minify:'esbuild',cssMinify:true,target:'es2022',rollupOptions:{input:Object.fromEntries(['home','solutions','projects','services','about','sitemap'].map(page=>[page,resolve(page==='home'?'index.html':`${page}/index.html`)]))}}});
