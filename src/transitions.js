// Same-origin document transitions, with a short fallback for older browsers.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nativeTransitions = 'onpageswap' in window && 'startViewTransition' in document;
const knownPaths = new Set(['/', '/solutions/', '/projects/', '/services/', '/about/', '/sitemap/']);
const prefetched = new Set();
let navigating = false;
function pageDestination(anchor) {
 if (!anchor || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return null;
 const url = new URL(anchor.href, location.href);
 if (url.origin !== location.origin || !knownPaths.has(url.pathname) || url.pathname === location.pathname) return null;
 return url;
}
function prefetch(anchor) {
 const url = pageDestination(anchor);
 if (!url || prefetched.has(url.pathname) || navigator.connection?.saveData) return;
 prefetched.add(url.pathname);
 const link = document.createElement('link');link.rel='prefetch';link.href=url.href;link.as='document';document.head.append(link);
}
document.addEventListener('pointerover', event=>prefetch(event.target.closest('a[href]')), {passive:true});
document.addEventListener('focusin', event=>prefetch(event.target.closest('a[href]')));
if (!nativeTransitions && !reduced) {
 document.addEventListener('click', event=>{
  if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
  const url=pageDestination(event.target.closest('a[href]'));
  if(!url)return;
  event.preventDefault();if(navigating)return;navigating=true;
  const animation=document.querySelector('main').animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:240,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  animation.finished.then(()=>location.assign(url.href));
 });
 window.addEventListener('pageshow',event=>{if(event.persisted){navigating=false;document.querySelector('main')?.getAnimations().forEach(animation=>animation.cancel())}});
}
