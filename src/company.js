import {setupBackToTop} from './back-to-top.js';
import './style.css';
import './company.css';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
const page=location.pathname.split('/').filter(Boolean)[0];


const header=document.querySelector('.topbar');


const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);
const lenis=new Lenis({duration:1.25,smoothWheel:!reduced,anchors:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(time=>lenis.raf(time*1000));gsap.ticker.lagSmoothing(0);setupBackToTop(lenis);
if(!reduced){
 gsap.from('.company-hero-copy h1',{y:35,duration:.9,ease:'power3.out'});
 gsap.to('.company-hero-photo',{yPercent:page==='projects'?8:16,scale:page==='projects'?1.025:1.08,ease:'none',scrollTrigger:{trigger:'.company-hero',start:'top top',end:'bottom top',scrub:1}});
 gsap.utils.toArray('.company-reveal').forEach(heading=>{
  heading.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));const text=heading.textContent;heading.textContent='';
  text.split(/(\s+)/).forEach(part=>{if(/\s+/.test(part)){heading.append(document.createTextNode(part));return;}const span=document.createElement('span');span.textContent=part;heading.append(span)});
  gsap.fromTo(heading.querySelectorAll('span'),{color:'#858585'},{color:'#171719',stagger:.12,ease:'none',scrollTrigger:{trigger:heading,start:'top 88%',end:'bottom 50%',scrub:.6}});
 });
 gsap.utils.toArray('.company-story-photo').forEach(photo=>gsap.from(photo,{y:40,opacity:0,duration:1,ease:'power2.out',scrollTrigger:{trigger:photo,start:'top 90%',once:true}}));
}
document.querySelectorAll('.topbar nav,footer nav').forEach(nav=>{
 const links=[...nav.querySelectorAll('a')];let selected=links.find(link=>link.getAttribute('href')===`/${page}/`)||null;
 links.forEach(link=>{link.classList.remove('active');if(link===selected)link.setAttribute('aria-current','page')});
 const highlight=document.createElement('span');highlight.className='nav-highlight';nav.prepend(highlight);
 function move(link,instant=false){if(!link){links.forEach(a=>a.classList.remove('highlighted'));gsap.to(highlight,{opacity:0,duration:reduced||instant?0:.3,overwrite:true});return;}links.forEach(a=>a.classList.toggle('highlighted',a===link));gsap.to(highlight,{x:link.offsetLeft,y:link.offsetTop,width:link.offsetWidth,height:link.offsetHeight,opacity:1,duration:reduced||instant?0:.55,ease:'power2.inOut',overwrite:true})}
 links.forEach(link=>{link.addEventListener('pointerenter',()=>move(link));link.addEventListener('focus',()=>move(link))});nav.addEventListener('pointerleave',()=>move(selected));nav.addEventListener('focusout',event=>{if(!nav.contains(event.relatedTarget))move(selected)});new ResizeObserver(()=>move(selected,true)).observe(nav);move(selected,true);
});
const search=document.createElement('dialog');search.id='search-dialog';search.setAttribute('data-lenis-prevent','');search.setAttribute('aria-label','Search Gwency');search.innerHTML='<form method="dialog"><button class="close-dialog" aria-label="Close search">×</button></form><label for="search-input">What are you looking for?</label><input id="search-input" type="search" placeholder="Search Gwency…"/><div id="search-results"></div>';document.body.append(search);
const searchItems=[['Home','/'],['Solutions','/solutions/'],['Projects','/projects/'],['Services','/services/'],['About','/about/']];
function renderSearch(){const input=search.querySelector('input').value.toLowerCase();const hits=searchItems.filter(([title])=>title.toLowerCase().includes(input));search.querySelector('#search-results').innerHTML=hits.length?hits.map(([title,url],i)=>`<a href="${url}"><span class="search-index">0${i+1}</span><span class="search-result-title">${title}</span><span class="search-result-arrow">↗</span></a>`).join(''):'<p>No pages found. Try another word.</p>';gsap.from('#search-results a',{opacity:0,y:reduced?0:-16,duration:reduced?0:.5,stagger:.055})}
function closeSearch(){gsap.to(search,{yPercent:-100,duration:reduced?0:.55,ease:'power3.inOut',onComplete:()=>search.close()})}
header.querySelector('.search-button').addEventListener('click',()=>{search.showModal();lenis.stop();renderSearch();gsap.fromTo(search,{xPercent:0,yPercent:reduced?0:-100},{yPercent:0,duration:reduced?0:.75,ease:'power3.inOut',onComplete:()=>search.querySelector('input').focus()})});search.querySelector('input').addEventListener('input',renderSearch);search.querySelector('form').addEventListener('submit',event=>{event.preventDefault();closeSearch()});search.addEventListener('cancel',event=>{event.preventDefault();closeSearch()});search.addEventListener('close',()=>lenis.start());
await import('./weather.js');
window.addEventListener('load',()=>ScrollTrigger.refresh());
