# Security policy

This is a static website. Secrets must never be added to browser-delivered code, HTML, public assets or repository history. Only the `dist/` build is published. Production source maps are disabled.

The deployment restricts scripts and network destinations through Content Security Policy and uses anti-framing, MIME-sniffing, HSTS, referrer, cross-origin and feature-permission headers. Inline style attributes remain permitted for GSAP animations; inline scripts and eval are blocked.

Dependencies are locked and audited in CI. Review updates and reports before deployment. To report an issue, use the repository's private security advisory feature when available; avoid publishing exploit details or credentials in a public issue.

No automated scan can guarantee the absence of every security issue. Public HTML, CSS, JavaScript and assets can be inspected regardless of minification.
