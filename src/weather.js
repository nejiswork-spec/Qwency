const labels = document.querySelectorAll('.weather');
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
let location = null;
let temperature = null;
let weatherState = 'Detecting location…';
let weatherRequest = null;
let locationVersion = 0;
const storageKey = 'gwency-weather-city-v1';
const validLocation = value => value && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90 && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180 && typeof value.name === 'string';
const timezoneIsValid = value => { try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return !!value; } catch { return false; } };
const readStorage = () => { try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; } };
function storeCity(value) { try { value ? localStorage.setItem(storageKey, JSON.stringify(value)) : localStorage.removeItem(storageKey); } catch {} }
async function requestJSON(url, signal) {
 const response = await fetch(url, { signal: signal || AbortSignal.timeout(10000) });
 if (!response.ok) throw new Error('Service unavailable');
 return response.json();
}
function renderWeather() {
 const timezone = timezoneIsValid(location?.timezone) ? location.timezone : browserTimezone;
 const now = new Date();
 const parts = new Intl.DateTimeFormat('en-GB', {timeZone:timezone,weekday:'short',day:'numeric',month:'short'}).formatToParts(now);
 const part = type => parts.find(value => value.type === type)?.value || '';
 const date = `${part('weekday')} ${part('day')} ${part('month')}`.toUpperCase();
 const time = new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
 const weather = temperature === null ? '' : `${temperature}°C`;
 labels.forEach(label => {
  label.textContent = `${date} \\ ${time}${weather ? ` \\ ${weather}` : ''}`;
  label.title = `${location?.name || 'Choose location'} · Change weather location`;
  label.setAttribute('aria-label',`${location?.name || 'Local weather'}, ${date}, ${time}, ${weather}. Change location`);
 });
 document.querySelector('#weather-current').textContent = location ? `${location.name} · ${temperature === null ? weatherState : `${temperature}°C`}` : weatherState;
}
async function refreshWeather() {
 if (!location) return;
 weatherRequest?.abort();
 const controller = new AbortController(); weatherRequest = controller;
 const timeout = setTimeout(() => controller.abort(), 10000);
 const selected = location;
 try {
  const params = new URLSearchParams({latitude:selected.latitude,longitude:selected.longitude,current:'temperature_2m',timezone:'auto'});
  const data = await requestJSON(`https://api.open-meteo.com/v1/forecast?${params}`,controller.signal);
  if (selected !== location || controller.signal.aborted) return;
  if (!Number.isFinite(data.current?.temperature_2m)) throw new Error('Weather unavailable');
  temperature = Math.round(data.current.temperature_2m);
  if (timezoneIsValid(data.timezone)) location.timezone = data.timezone;
  weatherState = '';
 } catch {
  if (selected !== location || weatherRequest !== controller) return;
  temperature = null; weatherState = 'Weather unavailable';
 } finally { clearTimeout(timeout); if (selected === location) renderWeather(); }
}
function selectLocation(value, save = false) {
 if (!validLocation(value)) throw new Error('Invalid location');
 location = {...value, timezone:timezoneIsValid(value.timezone)?value.timezone:browserTimezone};
 temperature = null; weatherState = 'Loading weather…';
 
 renderWeather(); refreshWeather();
}
async function detectLocation() {
 const version = ++locationVersion;
 status.textContent = 'Detecting your approximate city…';
 try {
  const data = await requestJSON('https://ipapi.co/json/');
  if (version !== locationVersion) return;
  if (data.error || !data.city) throw new Error('Location unavailable');
  selectLocation({latitude:data.latitude,longitude:data.longitude,name:[data.city,data.country_name].filter(Boolean).join(', '),timezone:data.timezone});
  status.textContent = 'Approximate location detected. You can choose a different city below.';
 } catch {
  if (version !== locationVersion) return;
  status.textContent = 'Could not detect your city. Search below or use your current location.';
  if (!location) {weatherState='Choose location'; renderWeather();}
 }
}
const panel = document.createElement('dialog');
panel.id = 'weather-dialog';
panel.setAttribute('aria-labelledby','weather-heading');
panel.innerHTML = `<button class="weather-close" aria-label="Close location settings">×</button><h2 id="weather-heading">Your local weather.</h2><p id="weather-current" aria-live="polite"></p><div class="weather-actions"><button id="weather-precise">Use my current location ↗</button><button id="weather-auto">Auto-detect city</button></div><form id="weather-city-form"><label for="weather-city">Or choose a city</label><div class="weather-search-row"><input id="weather-city" placeholder="City name" required minlength="2" autocomplete="off"/><button type="submit">Search</button></div></form><p id="weather-status" role="status"></p><div id="weather-cities"></div><p class="weather-note">Automatic detection uses your IP address. Precise location asks for permission and is sent to Open-Meteo for weather. Your current location is the default. You can choose another city for this visit.</p>`;
document.body.append(panel);
const status = panel.querySelector('#weather-status');
const cityInput = panel.querySelector('#weather-city');
labels.forEach(label => label.addEventListener('click', () => {panel.showModal(); cityInput.focus();}));
panel.querySelector('.weather-close').addEventListener('click',()=>panel.close());
panel.querySelector('#weather-auto').addEventListener('click',()=>{storeCity(null);detectLocation();});
function useCurrentLocation() {
 const version = ++locationVersion;
 const fallback = () => {
  if(version !== locationVersion)return;
  detectLocation();
 };
 if (!navigator.geolocation || !window.isSecureContext) {fallback();return;}
 weatherState='Locating you…';renderWeather();
 status.textContent='Waiting for your location permission…';
 navigator.geolocation.getCurrentPosition(position=>{
  if (version !== locationVersion) return;
  storeCity(null);
  selectLocation({latitude:position.coords.latitude,longitude:position.coords.longitude,name:'Your current location',timezone:browserTimezone});
  status.textContent='Using your current location. Precise coordinates are not saved.';
 },fallback,{timeout:15000,maximumAge:300000,enableHighAccuracy:false});
}
panel.querySelector('#weather-precise').addEventListener('click',useCurrentLocation);
let searchVersion = 0;
panel.querySelector('#weather-city-form').addEventListener('submit',async event=>{
 event.preventDefault();const query=cityInput.value.trim();if(query.length<2)return;
 const version=++searchVersion;
 const results=panel.querySelector('#weather-cities');results.replaceChildren();status.textContent='Finding cities…';
 try {
  const params=new URLSearchParams({name:query,count:6,language:'en',format:'json'});
  const data=await requestJSON(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if(version!==searchVersion)return;
  const cities=(data.results||[]).filter(validLocation);
  status.textContent=cities.length?'Choose your city:':'No cities found. Try another name.';
  cities.forEach(city=>{
   const button=document.createElement('button');button.type='button';
   button.textContent=[city.name,city.admin1,city.country].filter(Boolean).join(', ');
   button.addEventListener('click',()=>{
    ++locationVersion;
    selectLocation({latitude:city.latitude,longitude:city.longitude,name:[city.name,city.country].filter(Boolean).join(', '),timezone:city.timezone},true);
    status.textContent='City selected for this visit. Weather will refresh every 15 minutes.';results.replaceChildren();
   });results.append(button);
  });
 }catch{if(version===searchVersion)status.textContent='City search is unavailable. Please try again.';}
});
renderWeather();
storeCity(null);
useCurrentLocation();
setInterval(renderWeather,1000);
setInterval(refreshWeather,15*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderWeather();refreshWeather();}});
