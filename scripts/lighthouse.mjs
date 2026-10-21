import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=process.argv[2]||'http://localhost:4173';
const pages=process.argv.slice(3);if(!pages.length)pages.push('home','solutions','projects','services','about','sitemap');
await fs.mkdir('audit',{recursive:true});
const results=[];
for(const page of pages){
 const url=base+(page==='home'?'/':`/${page}/`);const prefix=`audit/mobile-${page}`;
 const args=['node_modules/lighthouse/cli/index.js',url,'--chrome-flags=--headless=new --no-sandbox','--output=json','--output=html',`--output-path=${prefix}`,'--quiet'];
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true,env:{...process.env,CHROME_PATH:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Lighthouse failed: ${page} (${code})`)))});
 const report=JSON.parse(await fs.readFile(`${prefix}.report.json`,'utf8'));
 const summary={page,scores:Object.fromEntries(Object.entries(report.categories).map(([name,category])=>[name,Math.round(category.score*100)])),lcp:report.audits['largest-contentful-paint'].displayValue,cls:report.audits['cumulative-layout-shift'].displayValue,failures:Object.entries(report.audits).filter(([,a])=>a.score===0&&a.scoreDisplayMode==='binary').map(([name])=>name)};
 results.push(summary);console.log(JSON.stringify(summary));
 await fs.writeFile('audit/summary.json',JSON.stringify(results,null,2));
}
