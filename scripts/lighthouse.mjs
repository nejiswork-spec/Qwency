import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const base=process.argv[2]||'http://localhost:4173';
const pages=process.argv.slice(3);if(!pages.length)pages.push('home','solutions','projects','services','about','sitemap');
const runs=Math.max(1,Math.min(3,Number(process.env.LIGHTHOUSE_RUNS)||1));
await fs.mkdir('audit',{recursive:true});
const results=[];
for(const page of pages){
 const url=base+(page==='home'?'/':`/${page}/`);const reports=[];
 for(let run=1;run<=runs;run++){
  const prefix=`audit/mobile-${page}-run-${run}`;
  const args=['node_modules/lighthouse/cli/index.js',url,'--chrome-flags=--headless=new --no-sandbox','--output=json','--output=html',`--output-path=${prefix}`,'--quiet'];
  const chrome=process.env.CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/google-chrome');
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true,env:{...process.env,CHROME_PATH:chrome}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Lighthouse failed: ${page} (${code})`)))});
  const report=JSON.parse(await fs.readFile(`${prefix}.report.json`,'utf8'));reports.push({report,prefix});
 }
 reports.sort((a,b)=>a.report.categories.performance.score-b.report.categories.performance.score);
 const {report,prefix}=reports[Math.floor(reports.length/2)];
 await fs.copyFile(`${prefix}.report.json`,`audit/mobile-${page}.report.json`);await fs.copyFile(`${prefix}.report.html`,`audit/mobile-${page}.report.html`);
 const summary={page,runs,scores:Object.fromEntries(Object.entries(report.categories).map(([name,category])=>[name,Math.round(category.score*100)])),lcp:report.audits['largest-contentful-paint'].displayValue,cls:report.audits['cumulative-layout-shift'].displayValue,failures:Object.entries(report.audits).filter(([,a])=>a.score===0&&a.scoreDisplayMode==='binary').map(([name])=>name)};
 results.push(summary);console.log(JSON.stringify(summary));
 if(process.env.GITHUB_ACTIONS)console.log(`::notice title=Lighthouse ${page}::${JSON.stringify(summary.scores)}`);
 await fs.writeFile('audit/summary.json',JSON.stringify(results,null,2));
}
