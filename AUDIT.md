# Website audit — 21 October 2026

## Scope and measurements

All six public pages were audited against the optimized production build with Lighthouse 13.5.0, default simulated mobile throttling in headless Chrome. The local server mirrors the deployment's security headers and Brotli compression. These are lab scores, not field Core Web Vitals; different devices, networks and audit versions may vary.

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| home | 96 | 100 | 100 | 100 | 2.5 s | 0 |
| solutions | 96 | 100 | 100 | 100 | 2.4 s | 0 |
| projects | 97 | 100 | 100 | 100 | 2.5 s | 0 |
| services | 97 | 100 | 100 | 100 | 2.3 s | 0 |
| about | 95 | 100 | 100 | 100 | 2.5 s | 0 |
| sitemap | 98 | 100 | 100 | 100 | 2.1 s | 0 |

The live homepage baseline was 61 Performance, 91 Accessibility, 96 Best Practices and 100 SEO. Its measured LCP was 20.6 seconds. The optimized homepage measured 2.5 seconds locally. Baseline and final runs use different delivery environments, so the exact difference is not a controlled field comparison.

## Verified checks

- Production build succeeds; JavaScript, CSS and HTML are minified.
- 23 Node regression checks pass: all six routes, security-header configuration, unpublished/sensitive path 404s, correct MIME types, image sizing, metadata, canonical URLs, navigation fragments, duplicate IDs, robots/sitemap coverage, source-map exclusion and bounded raster image sizes.
- npm dependency audit reports zero known vulnerabilities.
- Automated checks found no exposed credentials matching common token/private-key patterns. This is a limited pattern scan, not proof that arbitrary secrets cannot exist.
- Browser checks cover search filtering and markup-shaped search input, service expansion, page navigation and the Sitemap's unselected navigation state.
- Keyboard improvements include a skip link, clear focus styles, accordion control relationships and a focusable slideshow pause control. Reduced-motion preferences are respected.

## Main changes

- Replaced multi-megabyte PNGs with WebP variants and responsive hero images; the large image conversion reduced their combined weight by roughly 94%. Unoptimized source assets are excluded from deployment.
- Rendered company pages and service cards into their initial HTML so useful content does not depend on JavaScript. Removed the loading veil and runtime icon rendering.
- Prioritized hero images, delayed offscreen slide requests, supplied image dimensions, and preserved zero measured layout shift.
- Added CSP, anti-framing, MIME-sniffing, HSTS, referrer, cross-origin and feature-permission headers. Executable inline scripts and eval are blocked; inline styles remain allowed for animation.
- Corrected contrast and ARIA issues. Precise location is requested only after a user action or an existing permission grant; otherwise approximate city weather is used.
- Added complete metadata, canonical URLs, robots.txt, sitemap.xml, an intentional 404 page, and pinned CI actions.
- Added repeatable dependency, build, regression and Lighthouse checks in GitHub Actions.

## Limits

The site is static and has no application backend, account system, payment flow or database to penetration-test. This audit is not a guarantee against every future vulnerability and does not replace a manual WCAG audit. Business copy, illustrative metrics and project concepts are not independently verified. Browser-delivered HTML, CSS, JavaScript and images remain inspectable; minification and disabled source maps do not make a public site impossible to reverse engineer. Weather providers can be unavailable or return approximate data.
