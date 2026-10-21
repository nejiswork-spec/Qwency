import fs from 'node:fs/promises';
const pages=['home','solutions','projects','services','about','sitemap'];
const failures=[];
for(const page of pages){
 const report=JSON.parse(await fs.readFile(`audit/mobile-${page}.report.json`,'utf8'));
 for(const [category,minimum] of Object.entries({performance:.9,accessibility:1,'best-practices':1,seo:1})){
  const actual=report.categories[category].score;
  if(actual<minimum){const message=`${page}: ${category} ${Math.round(actual*100)} is below ${minimum*100}`;failures.push(message);if(process.env.GITHUB_ACTIONS)console.log(`::error title=Lighthouse quality gate::${message}`);}
 }
}
if(failures.length)throw new Error(failures.join('\n'));
console.log('PASS all six pages: performance ≥90, accessibility/best practices/SEO 100');
