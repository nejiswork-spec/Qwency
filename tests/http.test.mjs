import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
let server;const origin='http://127.0.0.1:4180';
before(async()=>{
 server=spawn(process.execPath,['scripts/audit-server.mjs'],{env:{...process.env,PORT:'4180'},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('Test server startup timed out')),10000);
  server.stdout.on('data',data=>{if(data.toString().includes('ready')){clearTimeout(timeout);resolve()}});
  server.on('error',reject);server.on('exit',code=>{if(code)reject(new Error(`Server failed: ${code}`))});
 });
});
after(()=>server?.kill());
for(const route of ['/','/solutions/','/projects/','/services/','/about/','/sitemap/'])test(`HTTP route and security headers: ${route}`,async()=>{
 const response=await fetch(origin+route);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);
 assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('x-frame-options'),'DENY');assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);assert.match(response.headers.get('permissions-policy'),/geolocation=\(self\)/);
});
for(const route of ['/.env','/.git/config','/src/company.js','/src/weather.js','/assets/application.js.map','/not-a-real-page/'])test(`Unpublished/sensitive path returns 404: ${route}`,async()=>{const response=await fetch(origin+route);assert.equal(response.status,404);assert.match(await response.text(),/find your way back/)});
test('images and favicon use the correct MIME types',async()=>{for(const [route,type]of [['/images/hero.webp','image/webp'],['/favicon.svg','image/svg+xml']]){const response=await fetch(origin+route);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),type)}});
