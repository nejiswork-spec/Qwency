# Gwency

Full-width responsive agriculture and renewable energy landing page built with Vite, Tailwind CSS, GSAP ScrollTrigger and Lenis.

## Development

npm install
npm run dev

## Production

npm run build
npm run preview

Generated photography is stored locally in public/images. The supplied Aivora logo is used in the footer. Features include scroll-driven hero parallax, staggered reveals, animated statistics, expandable offerings, project selectors, service details and local section search. Reduced-motion preferences are respected. Contact actions use email and telephone links; no backend or registration service is connected.

## Photography credits
Solar metric card: Adrinil Dennis / Pexels, https://www.pexels.com/photo/solar-panel-closeup-27873610/ (downloaded locally as solar-real.jpg).

## Company pages
- /solutions/ — irrigation, crop intelligence and renewable energy
- /projects/ — four illustrative project concepts, not verified client case studies
- /services/ — assessment, integration and ongoing support
- /about/ — purpose, approach and company values

Header and footer navigate between pages; local Explore and back-to-top links scroll within a page. All five HTML entries are included in the production build. Weather automatically detects an approximate city through ipapi.co, supports Open-Meteo city search and optional browser geolocation, and saves only manually selected cities in localStorage. API availability and limits apply.

## Hosting
Run `npm run build` to create the production site in dist/. All six pages have their own HTML entry. Vercel configuration is included in vercel.json.
