# Violin Tuner – PWA

A lightweight, offline-capable **progressive web app** for tuning a violin. Uses the Web Audio API to detect pitch in real time and auto-detects the nearest violin string (G3, D4, A4, E5).

## Features
- **Auto string detection** – automatically selects the closest violin string.
- **Visual tuning needle** – ±50 cents range, color-coded accuracy.
- **Offline support** – works without internet after first load.
- **iOS/Android installable** – add to home screen for an app-like experience.
- **No tracking** – all audio is processed locally in your browser.

## How to Use
1. Open the app in a modern browser over **HTTPS**.
2. Tap **Start** and allow microphone access.
3. Play an open string on your violin.
4. Center the needle to tune – left = flat, right = sharp.

## Installation (PWA)
### iOS (Safari)
1. Open the app URL in Safari.
2. Tap the **Share** icon → **Add to Home Screen**.
3. Launch from the home screen icon.

### Android (Chrome/Edge)
1. Open the app URL.
2. Tap the **Install** or **Add to Home Screen** prompt.

Once installed, the tuner works offline.

## Development
### Files
- `index.html` – Main HTML layout and style.
- `tuner.js` – Pitch detection logic and UI updates.
- `manifest.json` – PWA metadata.
- `sw.js` – Service worker for offline caching.
- `favicon.svg` – Base artwork for icons.
- `icon-192.png`, `icon-512.png` – Generated from `favicon.svg`.

### Local Testing
Serve over HTTPS or use `http://localhost` to test microphone access:
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

### Deployment
For **GitHub Pages**:
1. Create a public repo.
2. Place all files in the repo root.
3. Push to the `main` branch.
4. Enable Pages in repo settings → **Pages** → source: `main` branch, `/ (root)`.
5. Open the provided HTTPS link.

For **Netlify/Vercel**:
- Drag-and-drop the folder onto Netlify, or link your repo.
- Ensure HTTPS is enabled for microphone access.

## Security Notes
- All processing is done locally; no audio leaves your device.
- The service worker caches assets for offline use; bump the `CACHE` name in `sw.js` to force updates.
- To harden further, restrict service worker caching to same-origin assets only.

## License
MIT License – free to use, modify, and share.
