import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {parseHTML} from 'linkedom';
const pages=['index.html','solutions/index.html','projects/index.html','services/index.html','about/index.html','sitemap/index.html'];
for(const page of pages)test(`HTML, metadata, images and links: ${page}`,async()=>{
 const html=await fs.readFile(`dist/${page}`,'utf8');const {document}=parseHTML(html);
 assert.equal(document.documentElement.lang,'en');assert.equal(document.querySelectorAll('h1').length,1);assert.ok(document.querySelector('main#main-content'));
 assert.ok(document.querySelector('title').textContent.length>8);assert.ok(document.querySelector('meta[name="description"]').content.length>50);
 assert.ok(document.querySelector('link[rel="canonical"]').href.startsWith('https://qwency-ten.vercel.app/'));
 assert.ok(document.querySelector('.skip-link'));assert.ok(document.querySelector('footer [href="/sitemap/"]'));
 const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
 for(const image of document.querySelectorAll('img')){
  assert.ok(image.hasAttribute('alt'),'Image missing alt');assert.ok(Number(image.getAttribute('width'))>0,'Missing width');assert.ok(Number(image.getAttribute('height'))>0,'Missing height');
  await fs.access(path.join('dist',image.getAttribute('src')));
 }
 const hero=document.querySelector('.hero-image,.company-hero-photo');assert.equal(hero.getAttribute('fetchpriority'),'high');assert.ok(hero.hasAttribute('srcset'));
 for(const link of document.querySelectorAll('a[href]')){
  const href=link.getAttribute('href');assert.ok(!/^javascript:/i.test(href));
  if(href.startsWith('#'))assert.ok(document.getElementById(href.slice(1)),`Broken fragment ${href}`);
  if(/^\/(?:[a-z]+\/)?$/.test(href))await fs.access(`dist${href}index.html`);
 }
 assert.equal(document.querySelectorAll('script:not([src])').length,0,'Unexpected inline executable script');
});
test('security policy restricts execution, framing, permissions and origins',async()=>{
 const config=JSON.parse(await fs.readFile('vercel.json'));const headers=Object.fromEntries(config.headers[0].headers.map(h=>[h.key,h.value]));
 assert.equal(headers['X-Content-Type-Options'],'nosniff');assert.equal(headers['X-Frame-Options'],'DENY');assert.ok(headers['Content-Security-Policy'].includes("script-src 'self'"));assert.ok(!headers['Content-Security-Policy'].includes('unsafe-eval'));assert.ok(headers['Content-Security-Policy'].includes("frame-ancestors 'none'"));assert.ok(headers['Permissions-Policy'].includes('camera=()'));
});
test('production contains no source maps, source modules, secrets or oversized PNGs',async()=>{
 async function walk(dir){const files=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);files.push(...e.isDirectory()?await walk(file):[file]);}return files;}
 for(const file of await walk('dist')){
  assert.ok(!/\.map$/.test(file),'Unexpected source map');assert.ok(!/\.env|auth\.json|\.git[\\/]/.test(file));
  if(/\.(?:js|html)$/.test(file)){const text=await fs.readFile(file,'utf8');assert.ok(!/(?:ghp_[A-Za-z0-9]{30,}|sk_live_[A-Za-z0-9]{20,}|-----BEGIN PRIVATE KEY-----)/.test(text),'Possible credential exposure');}
  if(/\.(?:webp|jpg|png)$/.test(file))assert.ok((await fs.stat(file)).size<250000,`Oversized raster: ${file}`);
 }
});
test('sitemap and robots enumerate public routes',async()=>{
 const xml=await fs.readFile('dist/sitemap.xml','utf8');for(const page of ['solutions','projects','services','about','sitemap'])assert.ok(xml.includes(`/${page}/`));assert.ok((await fs.readFile('dist/robots.txt','utf8')).includes('/sitemap.xml'));
});
test('Sitemap navigation is unselected without JavaScript',async()=>{const {document}=parseHTML(await fs.readFile('dist/sitemap/index.html','utf8'));assert.equal(document.querySelectorAll('nav [aria-current="page"]').length,0);});
