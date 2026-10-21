import './style.css';
import './company.css';
try {
 const isCompanyPage = /^\/(solutions|projects|services|about|sitemap)\/?$/.test(location.pathname);
 if (isCompanyPage) await import('./company.js');
 else await import('./main.js');
 await import('./transitions.js');
 await import('./favicon.js');
} finally {
 // Reveal only after styles and the correct page layout have loaded.
 document.documentElement.classList.remove('app-loading');
}
