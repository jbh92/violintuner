# Violin Tuner (PWA)

Minimal folder for GitHub Pages / Netlify / Vercel.

## Files
- `index.html` – UI + layout
- `tuner.js` – Web Audio + pitch detection (autocorrelation)
- `manifest.json` – PWA manifest
- `sw.js` – Service worker (offline cache)
- `favicon.svg` – Favicon and base artwork for icons
- `icon-192.png`, `icon-512.png` – PWA icons (export from the SVG)

## Deploy to GitHub Pages
1. Create a public repo and add these files in the repo root (no subfolder).
2. Commit & push.
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Choose `main` branch, `/ (root)` folder. Save.
4. Wait for the URL to appear at the top of the Pages section. Open it over HTTPS.
5. First visit caches the app. On iPhone Safari: Share → **Add to Home Screen**.

## Updates
- Bump the `CACHE` name in `sw.js` (e.g., `violin-tuner-v2`) to force clients to grab new assets.

## Troubleshooting
- **No mic prompt**: Make sure you’re on HTTPS (or `http://localhost`).
- **No audio** in iOS: Tap **Start** (user gesture is required) and confirm mic permission.
- **Icons look blurry**: Re-export higher quality PNGs from `favicon.svg`.