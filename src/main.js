import {setupBackToTop} from './back-to-top.js';
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createIcons, Search, Leaf, Droplet } from 'lucide';
createIcons({icons:{Search,Leaf,Droplet}});
gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = new Lenis({duration:1.25,smoothWheel:!reduced,anchors:true});
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(time=>lenis.raf(time*1000));
gsap.ticker.lagSmoothing(0);
setupBackToTop(lenis);
if(!reduced){
 gsap.from('.wordmark',{yPercent:100,opacity:0,duration:1.6,ease:'power3.out',delay:.15});
 gsap.from('.topbar',{opacity:0,y:16,duration:1,delay:.4});
 const hero = gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
 hero.to('.hero-image',{yPercent:22,scale:1.14,ease:'none'},0).to('.wordmark',{yPercent:65,scale:.92,opacity:0,ease:'none'},0);
 gsap.to('.marquee h2',{xPercent:-14,ease:'none',scrollTrigger:{trigger:'.metrics',start:'top bottom',end:'bottom top',scrub:1}});
 gsap.utils.toArray('.reveal').forEach(heading=>{
  const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   node.textContent.split(/(\s+)/).forEach(part=>{
    if(!part)return;
    if(/\s+/.test(part)){fragment.append(document.createTextNode(part));return;}
    const word=document.createElement('span');word.className='reveal-word';word.textContent=part;fragment.append(word);
   });node.replaceWith(fragment);
  });
  const words=heading.querySelectorAll('.reveal-word');
  gsap.fromTo(words,{color:'#c9c9c9'},{color:'#171719',stagger:.12,ease:'none',scrollTrigger:{trigger:heading,start:'top 86%',end:'bottom 48%',scrub:.6}});
 });
 gsap.from('.metric',{y:65,opacity:0,duration:.9,stagger:.14,ease:'power3.out',scrollTrigger:{trigger:'.metric-grid',start:'top 85%',once:true}});
 gsap.to('.project-image',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.project',start:'top bottom',end:'bottom top',scrub:1}});
 const count={value:0};gsap.to(count,{value:89,duration:2,ease:'power2.out',scrollTrigger:{trigger:'.health',start:'top 85%',once:true},onUpdate:()=>document.querySelector('[data-count]').textContent=count.value.toFixed(1)});
}
const offerings = [...document.querySelectorAll('.offering')];
let refreshTimer;
let offeringHoverTimer;
function activateOffering(target, toggle = false) {
 clearTimeout(offeringHoverTimer);
 const next = toggle && target.classList.contains('open') ? null : target;
 offerings.forEach(item => {
  const content = item.querySelector('.offering-content');
  const open = item === next;
  if(item.classList.contains('open') === open)return;
  item.classList.toggle('open', open);
  item.querySelector('.offering-toggle').setAttribute('aria-expanded', String(open));
  content.inert = !open;
  const inner=content.querySelector('.offering-inner');
  gsap.to(content,{height:open?inner.offsetHeight:0,opacity:open?1:0,duration:reduced?0:.75,ease:'power2.inOut',overwrite:true,onComplete:()=>{if(open&&item.classList.contains('open'))gsap.set(content,{height:'auto'})}});
  gsap.to(inner,{y:open?0:8,opacity:open?1:0,duration:reduced?0:(open?.65:.3),delay:reduced?0:(open?.1:0),ease:'power2.out',overwrite:true});
 });
 clearTimeout(refreshTimer);
 refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 850);
}
offerings.forEach(item => {
 const content = item.querySelector('.offering-content');
 const inner = document.createElement('div');
 inner.className = 'offering-inner';
 while(content.firstChild) inner.append(content.firstChild);
 content.append(inner);
 const open = item.classList.contains('open');
 gsap.set(content,{height:open?'auto':0,opacity:open?1:0});
 content.inert = !open;
 item.addEventListener('pointerenter',event=>{
  clearTimeout(offeringHoverTimer);
  if(event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches && !item.classList.contains('open')) offeringHoverTimer=setTimeout(()=>activateOffering(item),140);
 });
 item.addEventListener('pointerleave',()=>clearTimeout(offeringHoverTimer));
 item.querySelector('.offering-toggle').addEventListener('click',()=>activateOffering(item,true));
 item.querySelector('.offering-toggle').addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();
   const index=(offerings.indexOf(item)+(event.key==='ArrowDown'?1:-1)+offerings.length)%offerings.length;
   offerings[index].querySelector('button').focus();activateOffering(offerings[index]);
  }
 });
});
const projects=[['69%','To transition to a more stable, reliable<br>and sustainable energy supply.','As the world decarbonizes, the energy transition is on. It needs smarter,<br> more efficient and sustainable infrastructure.'],['84%','Every drop matters.<br>Every acre has potential.','Precision irrigation puts water exactly where it is needed,<br> helping growers do more with less.'],['92%','A connected view.<br>A more productive tomorrow.','From the field to your fingertips, our technology connects<br> people, resources and possibilities.'],['33%','Growing a future<br>that works for everyone.','Sustainable solutions engineered for lasting impact.<br> Better for growers. Better for our planet.']];
const projectSection=document.querySelector('.project');
const projectImages=['/images/solar.png','/images/project-irrigation.png','/images/project-connected.png','/images/project-wind.png'];
const projectLabels=['Infrastructure','Precision irrigation','Connected agriculture','Sustainable futures'];
const projectAlts=['Solar panel mounted above agricultural land','Center pivot irrigation watering a green field','Farmer checking crop data in the field','Wind turbines across rolling farmland'];
const imageStage=document.querySelector('.project-image');
imageStage.style.backgroundImage='none';
const layers=projectImages.map((src,i)=>{
 const image=document.createElement('img');image.className='project-slide-image';image.src=src;image.alt=projectAlts[i];image.style.opacity=i===0?1:0;imageStage.append(image);return image;
});
const projectButtons=[...document.querySelectorAll('.project-controls button')];
projectButtons.forEach(button=>{button.innerHTML='<span class="project-progress"></span>';button.title=button.getAttribute('aria-label');});
const pauseButton=document.createElement('button');pauseButton.className='project-pause';pauseButton.textContent='Ⅱ';pauseButton.setAttribute('aria-label','Pause project slideshow');
let slideIndex=0, inView=false, userPaused=false, progressTween;
function syncPlayback(){
 const running=inView&&!document.hidden&&!userPaused;
 if(progressTween)running?progressTween.play():progressTween.pause();
}
function playProject(index,immediate=false){
 slideIndex=index;progressTween?.kill();
 projectButtons.forEach((button,i)=>{
  button.classList.toggle('current',i===index);button.setAttribute('aria-current',i===index?'true':'false');
  gsap.set(button.querySelector('.project-progress'),{scaleX:0});
 });
 layers.forEach((layer,i)=>gsap.to(layer,{opacity:i===index?1:0,duration:reduced||immediate?0:1.1,ease:'power2.inOut',overwrite:true}));
 const body=document.querySelector('.project-body');
 gsap.killTweensOf(body);
 gsap.to(body,{opacity:0,y:8,duration:reduced||immediate?0:.2,onComplete:()=>{
  document.querySelector('#project-stat').textContent=projects[index][0];document.querySelector('#project-title').innerHTML=projects[index][1];document.querySelector('#project-description').innerHTML=projects[index][2];document.querySelector('.project-top .pill').textContent=projectLabels[index];
  gsap.to(body,{opacity:1,y:0,duration:reduced||immediate?0:.6,ease:'power2.out'});
 }});
 progressTween=gsap.to(projectButtons[index].querySelector('.project-progress'),{scaleX:1,duration:6,ease:'none',paused:true,onComplete:()=>playProject((slideIndex+1)%projects.length)});
 syncPlayback();
}
projectButtons.forEach((button,i)=>button.addEventListener('click',()=>playProject(i)));
pauseButton.addEventListener('click',()=>{userPaused=!userPaused;pauseButton.textContent=userPaused?'▷':'Ⅱ';pauseButton.setAttribute('aria-label',userPaused?'Play project slideshow':'Pause project slideshow');syncPlayback()});
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncPlayback()},{threshold:.2}).observe(projectSection);
document.addEventListener('visibilitychange',syncPlayback);
playProject(0,true);
const cards=[['Megawatt Capacity','Intelligent control systems bring dependable energy to every corner of your operation.'],['Increasing Productivity','Real-time insights help growers make precise decisions and get more from every acre.'],['Solar Panel Service','Expert installation and maintenance keep clean energy working at its best.'],['Hectar Area','A complete view of your land, with connected intelligence at every scale.'],['A Responsible Corporate','Our people are committed to safer operations and a more sustainable future.']];
const grid=document.querySelector('.collection-grid');
cards.forEach(([title,description],i)=>{const button=document.createElement('button');button.className='collection-card';button.setAttribute('aria-expanded','false');button.innerHTML=`<div class="photo-wrap"><div class="collection-photo" role="img" aria-label="${title}" style="background-position:${i*25}% center"></div></div><div class="collection-caption"><p>${title}</p><span aria-hidden="true">↗</span></div>`;button.addEventListener('click',()=>{const selected=button.classList.contains('selected');grid.querySelector('.collection-detail')?.remove();grid.querySelectorAll('button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-expanded','false')});if(!selected){button.classList.add('selected');button.setAttribute('aria-expanded','true');const detail=document.createElement('div');detail.className='collection-detail';detail.textContent=description;grid.append(detail)}ScrollTrigger.refresh()});grid.append(button)});
const dialog=document.querySelector('#search-dialog');const input=document.querySelector('#search-input');
const destinations=[['Home','/'],['Solutions — precision agriculture','/solutions/'],['Projects — ideas in the field','/projects/'],['Services — planning and support','/services/'],['About Gwency','/about/'],['Sitemap','/sitemap/']];
function search(){
 const query=input.value.toLowerCase();const hits=destinations.filter(([title])=>title.toLowerCase().includes(query));
 document.querySelector('#search-results').innerHTML=hits.length?hits.map(([title,url],i)=>`<a href="${url}"><span class="search-index">0${i+1}</span><span class="search-result-title">${title}</span><span class="search-result-arrow" aria-hidden="true">↗</span></a>`).join(''):'<p>No matches. Try “projects”, “health” or “services”.</p>';
 gsap.fromTo('#search-results a',{opacity:0,y:reduced?0:-16},{opacity:1,y:0,duration:reduced?0:.5,stagger:.055,ease:'power2.out',overwrite:true});
}
let closingSearch=false;
function closeSearch(afterClose){
 if(closingSearch||!dialog.open)return;closingSearch=true;
 gsap.to(dialog,{yPercent:reduced?0:-100,opacity:reduced?0:1,duration:reduced?0:.55,ease:'power3.inOut',overwrite:true,onComplete:()=>{dialog.close();closingSearch=false;afterClose?.()}});
}
document.querySelector('.search-button').addEventListener('click',()=>{
 if(dialog.open)return;dialog.showModal();lenis.stop();search();
 gsap.fromTo(dialog,{xPercent:0,yPercent:reduced?0:-100,opacity:1},{yPercent:0,duration:reduced?0:.75,ease:'power3.inOut',overwrite:true,onComplete:()=>input.focus({preventScroll:true})});
});
dialog.addEventListener('close',()=>lenis.start());
dialog.addEventListener('cancel',event=>{event.preventDefault();closeSearch()});
dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();closeSearch()});
input.addEventListener('input',search);
document.querySelector('#search-results').addEventListener('click',event=>{
 const link=event.target.closest('a');if(!link)return;event.preventDefault();
 const target=link.getAttribute('href');closeSearch(()=>{if(target.startsWith('#')){lenis.scrollTo(target);history.replaceState(null,'',target)}else{location.assign(target)}});
});
window.addEventListener('load',()=>ScrollTrigger.refresh());
// One sliding highlight shared by every link in each navigation.
document.querySelectorAll('.topbar nav, footer nav').forEach(nav=>{
 const links=[...nav.querySelectorAll('a')];
 const highlight=document.createElement('span');highlight.className='nav-highlight';highlight.setAttribute('aria-hidden','true');nav.prepend(highlight);
 let selected=links[0];
 function move(link,immediate=false){
  links.forEach(a=>a.classList.toggle('highlighted',a===link));
  gsap.to(highlight,{x:link.offsetLeft,y:link.offsetTop,width:link.offsetWidth,height:link.offsetHeight,opacity:1,duration:reduced||immediate?0:.55,ease:'power2.inOut',overwrite:true});
 }
 links.forEach(link=>{
  link.addEventListener('pointerenter',()=>move(link));
  link.addEventListener('focus',()=>move(link));
  link.addEventListener('click',()=>{selected=link;move(link)});
 });
 nav.addEventListener('pointerleave',()=>move(selected));
 nav.addEventListener('focusout',event=>{if(!nav.contains(event.relatedTarget))move(selected)});
 new ResizeObserver(()=>move(selected,true)).observe(nav);
 move(selected,true);
});


import './weather.js';

