# Digital Memorial Generator

This directory now ships the static **memorylife x Henry Ford** memorial scroll that should be published at `https://memorylife.eu/legacy/henry-ford/` (the old `/digital-memorial-generator/` route now just redirects there).

## Structure

- `index.html` - semantic markup for the full memorial experience.
- `assets/styles.css` - extracted styles from the demo page so they can be cached independently.
- `assets/app.js` - tiny script that preserves the theme/language toggle behaviour.
- `assets/favicon.png` - reused mark that appears both in the browser tab and inside the hero brand lockup.

## Updating

1. Edit `index.html` if you need to tweak the content or markup.
2. Place shared styles inside `assets/styles.css`; keep inline styles only when absolutely required for unique art direction.
3. Touch `assets/app.js` to adjust behaviour such as the theme switch or future interactions.
4. When adding new media, store them under `assets/` (prefer subfolders such as `assets/images/`) and reference them with relative paths so the page keeps working when hosted under `/legacy/henry-ford/`.

No build step is necessary-the page is a plain static bundle that can be uploaded directly to the production hosting.
