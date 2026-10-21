import fs from 'node:fs/promises';
import {minify} from 'html-minifier-terser';
const pages=['index.html','solutions/index.html','projects/index.html','services/index.html','about/index.html','sitemap/index.html'];
for(const page of pages){const path=`dist/${page}`;const html=await fs.readFile(path,'utf8');await fs.writeFile(path,await minify(html,{collapseWhitespace:true,removeComments:true,removeRedundantAttributes:true,removeScriptTypeAttributes:true,removeStyleLinkTypeAttributes:true,minifyCSS:true,minifyJS:true}));}
console.log('Minified all six HTML documents; Vite minified JS and CSS with source maps disabled.');
