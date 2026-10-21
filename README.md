# Gwency

A responsive company website built with Vite, Tailwind CSS, GSAP and Lenis.

## Work locally

Requires Node.js 22.12 or newer.

- `npm ci` installs the locked dependencies.
- `npm run dev` starts Vite.
- `npm run build` renders the company pages into HTML, builds minified JavaScript/CSS, and minifies HTML into `dist/`.
- `npm test` checks production pages, links, metadata, image dimensions, asset budgets and security configuration.

## Pages and content

`/`, `/solutions/`, `/projects/`, `/services/`, `/about/` and `/sitemap/` have separate HTML documents. Company content is defined in `src/page-content.js`; `scripts/render-pages.mjs` generates the five company documents during the build. Edit the homepage in `index.html`. Project entries are illustrative concepts, not verified client case studies.

Public images are optimized WebP files, with smaller variants for hero images. Unoptimized source images and screenshots are excluded from deployment and version control. Solar metric photography: [Adrinil Dennis / Pexels](https://www.pexels.com/photo/solar-panel-closeup-27873610/). Decorative portraits are from Random User; the footer logo was supplied by the owner.

## Weather

Weather data comes from Open-Meteo. Approximate city detection uses ipapi.co and is cached for one hour within the browser session. Precise location is used automatically only when permission was already granted; otherwise visitors can request it using the weather button. Precise coordinates are not stored. Weather updates every 15 minutes. Third-party outages fall back gracefully without fabricated temperatures.

The site has no server-side login, payment processing, database or stored API credentials. Contact actions use email/telephone links.

## Audit and CI

1. Build, then run `node scripts/audit-server.mjs`.
2. In another terminal run `npm run audit:lighthouse` (Chrome must be installed; set `CHROME_PATH` if needed).
3. Run `node scripts/verify-lighthouse.mjs` to check all six mobile pages against Performance ≥90 and Accessibility/Best Practices/SEO 100.

Reports are written to the ignored `audit/` directory. GitHub Actions runs dependency auditing, build tests and Lighthouse checks. Performance scores are laboratory measurements and can vary with browser version, CPU and network conditions.

## Hosting and security

GitHub: https://github.com/nejiswork-spec/Qwency
Production: https://qwency-ten.vercel.app

Vercel serves `dist/`. `vercel.json` defines CSP, HSTS, anti-framing, MIME-sniffing protection, referrer and permissions policies, and cache rules. JavaScript source maps are disabled; JavaScript, CSS and HTML are minified. No credentials belong in the public assets or frontend code. Browser-delivered code remains inspectable; minification is not a secrecy boundary.

Deployments are connected to `main`. Review the CI results and deployment checks after pushing changes. Automated audits do not prove that every possible vulnerability or accessibility issue is absent.
