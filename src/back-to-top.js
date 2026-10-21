import gsap from 'gsap';
export function setupBackToTop(lenis) {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const main=document.querySelector('main');
 let returning=false;
 document.querySelectorAll('.top-circle').forEach(button=>button.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  if(returning)return;returning=true;
  if(reduced){lenis.scrollTo(0,{immediate:true});returning=false;return;}
  lenis.stop();
  gsap.timeline().to(main,{y:26,duration:.22,ease:'power2.out'}).to(main,{y:0,duration:.9,ease:'power3.out',onStart:()=>{
   lenis.start();
   lenis.scrollTo(0,{duration:2.3,easing:t=>1-Math.pow(1-t,4),onComplete:()=>{returning=false;history.replaceState(null,'',location.pathname)}});
  },onComplete:()=>gsap.set(main,{clearProps:'transform'})});
 },{capture:true}));
}

