// A crisp two-color brand mark, updated only while the page is visible.
const favicon=document.querySelector('link[rel="icon"]');
const faviconColors=['/favicon.svg','/favicon-blue.svg'];
faviconColors.forEach(src=>{const image=new Image();image.src=src;});
let faviconColor=0;
setInterval(()=>{
 if(document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 faviconColor=(faviconColor+1)%faviconColors.length;
 if(favicon)favicon.href=faviconColors[faviconColor];
},8000);
