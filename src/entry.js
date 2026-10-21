import './style.css';
import './company.css';
const isCompanyPage=/^\/(solutions|projects|services|about|sitemap)\/?$/.test(location.pathname);
if(isCompanyPage) await import('./company.js');
else await import('./main.js');
await import('./transitions.js');
await import('./favicon.js');
