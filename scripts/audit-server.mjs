import {brotliCompressSync,constants} from 'node:zlib';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
  if(pathname.endsWith('/'))file=path.join(file,'index.html');
  let bytes,status=200;try{bytes=await fs.readFile(file)}catch{bytes=await fs.readFile(path.join(root,'404.html'));status=404;file='404.html';}
  const headers=Object.fromEntries(config.headers[0].headers.map(h=>[h.key,h.value]));
  // HTTP localhost is used only for reproducible local audits.
  headers['Content-Security-Policy']=headers['Content-Security-Policy'].replace('; upgrade-insecure-requests','');
  if(pathname.startsWith('/assets/'))headers['Cache-Control']='public, max-age=31536000, immutable';
  if(pathname.startsWith('/images/'))headers['Cache-Control']='public, max-age=86400';
  const compress=/\.(html|js|css|svg|xml|txt)$/.test(file)&&req.headers['accept-encoding']?.includes('br');
  if(compress){bytes=brotliCompressSync(bytes,{params:{[constants.BROTLI_PARAM_QUALITY]:4}});headers['Content-Encoding']='br';headers['Vary']='Accept-Encoding';}
  res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream',...headers});res.end(bytes);
 }catch{res.writeHead(400);res.end('Bad request');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Production audit server ready'));
