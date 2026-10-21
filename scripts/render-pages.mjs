import {Search,Leaf,Droplet} from 'lucide';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import sharp from 'sharp';
import {companyPages,renderCompanyContent} from '../src/page-content.js';
const origin='https://qwency-ten.vercel.app';
let home=await fs.readFile('index.html','utf8');
home=home.replace(/<style>html.app-loading body\{visibility:hidden\}html\{background:#fff\}<\/style><script>.*?<\/script>/,'').replace(' blocking="render"','');
const {document}=parseHTML(home);
document.documentElement.classList.remove('company-document');
document.querySelector('main').id='main-content';
if(!document.querySelector('.skip-link'))document.body.insertAdjacentHTML('afterbegin','<a class="skip-link" href="#main-content">Skip to content</a>');
document.querySelector('header').setAttribute('role','banner');document.querySelector('footer').setAttribute('role','contentinfo');
const hero=document.querySelector('.hero-image');
if(hero.tagName!=='IMG'){const image=document.createElement('img');image.className='hero-image';image.src='/images/hero.webp';image.alt='Agricultural grain silo beneath a blue sky';hero.replaceWith(image);}
const titles=['Megawatt Capacity','Increasing Productivity','Solar Panel Service','Hectare Area','Responsible Business'];
document.querySelector('.collection-grid').innerHTML=titles.map((title,i)=>`<button class="collection-card" type="button" aria-expanded="false" aria-controls="collection-detail"><span class="photo-wrap"><img class="collection-photo" src="/images/service-${i+1}.webp" alt="" width="400" height="400" loading="lazy" decoding="async"/></span><span class="collection-caption"><span class="collection-caption-text">${title}</span></span></button>`).join('')+'<div id="collection-detail" class="collection-detail" role="status" hidden></div>';
document.querySelector('#search-dialog').setAttribute('aria-label','Search Gwency');
document.querySelector('#search-dialog').setAttribute('data-lenis-prevent','');
for(const button of document.querySelectorAll('.offering-toggle')){const id=`offering-${button.closest('.offering').getAttribute('data-offering')}`;button.setAttribute('aria-controls',id);button.closest('.offering').querySelector('.offering-content').id=id;}
const header=document.querySelector('.topbar').outerHTML;const footer=document.querySelector('footer').outerHTML;
const base=document.toString();
function setMeta(doc,name,content,property=false){let element=doc.querySelector(`meta[${property?'property':'name'}="${name}"]`);if(!element){element=doc.createElement('meta');element.setAttribute(property?'property':'name',name);doc.head.append(element)}element.setAttribute('content',content)}
async function optimizeDocument(doc,path,page){
 const icons={search:Search,leaf:Leaf,droplet:Droplet};
 for(const icon of doc.querySelectorAll('[data-lucide]')){
  const name=icon.getAttribute('data-lucide');const nodes=icons[name]?.[2];if(!nodes)continue;
  const children=nodes.map(([tag,attrs])=>'<'+tag+' '+Object.entries(attrs).map(([k,v])=>k+'="'+v+'"').join(' ')+'></'+tag+'>').join('');
  icon.outerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="'+(icon.getAttribute('fill')||'none')+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+children+'</svg>';
 }

 for(const image of doc.querySelectorAll('img')){
  let src=image.getAttribute('src').replace(/\.png$/,'.webp');image.setAttribute('src',src);
  try{const meta=await sharp('public'+src).metadata();image.setAttribute('width',meta.width);image.setAttribute('height',meta.height)}catch{}
  image.setAttribute('decoding','async');
  if(image.classList.contains('hero-image')||image.classList.contains('company-hero-photo')){
   image.setAttribute('fetchpriority','high');image.setAttribute('loading','eager');
   image.setAttribute('srcset',`${src.replace('.webp','-768.webp')} 768w, ${src} 1600w`);image.setAttribute('sizes','100vw');
  }
 }
 doc.querySelectorAll('script[blocking]').forEach(script=>script.removeAttribute('blocking'));
 const description=page?companyPages[page].body:'Gwency brings precision irrigation, crop intelligence and resilient energy together to help agricultural operations make resources go further.';
 setMeta(doc,'description',description);setMeta(doc,'theme-color','#527cda');setMeta(doc,'og:title',doc.title,true);setMeta(doc,'og:description',description,true);setMeta(doc,'og:type','website',true);setMeta(doc,'og:url',origin+path,true);setMeta(doc,'og:image',origin+'/images/hero.webp',true);setMeta(doc,'twitter:card','summary_large_image');
 let canonical=doc.querySelector('link[rel="canonical"]');if(!canonical){canonical=doc.createElement('link');canonical.rel='canonical';doc.head.append(canonical)}canonical.href=origin+path;
 doc.querySelectorAll('.brand a').forEach(a=>a.href='/');
 doc.querySelectorAll('nav a').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current');if(a.getAttribute('href')===path)a.setAttribute('aria-current','page')});
 doc.querySelectorAll('a[href="/"],a[href^="/#"]').forEach(a=>{if(path==='/'&&a.getAttribute('href').startsWith('/#'))a.href=a.getAttribute('href').slice(1)});
 return '<!doctype html>\n'+doc.documentElement.outerHTML+'\n';
}
await fs.writeFile('index.html',await optimizeDocument(document,'/'));
for(const page of Object.keys(companyPages)){
 const {document:doc}=parseHTML(base);doc.title=`${companyPages[page].label} — Gwency`;
 const main=doc.querySelector('main');main.className=`company-page page-${page}`;main.innerHTML=renderCompanyContent(page);main.dataset.rendered=page;
 main.querySelector('.company-hero').insertAdjacentHTML('afterbegin',header);main.insertAdjacentHTML('beforeend',footer);
 doc.querySelector('#search-dialog')?.remove();
 await fs.writeFile(`${page}/index.html`,await optimizeDocument(doc,`/${page}/`,page));
}
await fs.writeFile('public/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/',...Object.keys(companyPages).map(page=>`/${page}/`)].map(path=>`<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>\n`);
console.log('Rendered all six pages with metadata and optimized image attributes.');
