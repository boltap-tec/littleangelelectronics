# Build the Android app (APK) for Little Angel Electronics

The app is now an **installable PWA** (Progressive Web App). That means you can turn
`index.html` into a real Android **APK** — with the gold app icon, a splash screen, its
own name, and full offline use — **without Android Studio, Java, or any coding**.

There are two ways to put it on a phone. Pick one.

---

## Option A — Just install it (fastest, no APK file)

Best for day-to-day use. Takes 15 seconds, looks and behaves like an installed app.

1. Open the hosted app in **Chrome** on the Android phone
   (your Vercel / GitHub Pages link, e.g. `https://your-app.vercel.app`).
2. Tap the **⋮** menu → **Install app** / **Add to Home screen**.
   (The login screen also shows an **“Install app on this device”** button when Chrome offers it.)
3. The gold icon appears on the home screen. Open it — it runs full-screen, no browser bar, and works offline.

**iPhone / iPad:** open the link in **Safari** → tap **Share ⬆️** → **Add to Home Screen**.
(The login screen shows this hint automatically on iOS.)

> Long-press the installed icon to get quick shortcuts: **New Sale, Dashboard, Payments, Cards**.

---

## Option B — Build a real `.apk` / `.aab` file (for sharing or Play Store)

Use this when you want an actual installer file to send to staff, or to publish on Google Play.
We use **PWABuilder** (free, made by Microsoft) — it reads the manifest and icons that are
already in this project and produces a signed Android package.

### Steps
1. **Host the app first** (PWABuilder needs a public `https://` link):
   - Push this repo to GitHub, then either
     - **Vercel:** import the repo at [vercel.com](https://vercel.com) → Deploy (no settings needed), **or**
     - **GitHub Pages:** repo **Settings → Pages →** deploy from the `main` branch root.
   - Confirm the link opens the app and that `https://your-link/manifest.webmanifest` loads.
2. Go to **[pwabuilder.com](https://www.pwabuilder.com)** and paste your `https://` link → **Start**.
   - It should score the **Manifest**, **Service Worker**, and **Icons** as present. ✅
3. Click **Package for stores → Android**.
4. In the Android options:
   - **Package ID:** `ae.littleangel.electronics` (or your own reverse-domain id — this is permanent for the Play Store).
   - **App name:** `Little Angel Electronics`
   - Leave **Signing key** on **“Create new”** the first time. **Download and keep the generated
     `signing.keystore` + passwords safe** — you need the *same* key to publish every future update.
5. Click **Generate** → download the `.zip`. It contains:
   - `app-release-signed.apk` → install directly on a phone (for staff / testing).
   - `app-release.aab` → upload to **Google Play Console** if publishing to the store.

### Install the APK on a phone
- Copy `app-release-signed.apk` to the phone, tap it, and allow
  **“Install unknown apps”** for your file manager when prompted.

> **Note on the icon:** PWABuilder builds the Android adaptive icon from `icon-maskable-512.png`
> (the one with extra padding), so the gold bolt stays fully visible inside Android’s circle/squircle mask.

---

## What makes this work (already in the repo)

| File | Purpose |
|------|---------|
| `manifest.webmanifest` | App name, colors, icons, shortcuts, standalone display |
| `sw.js` | Service worker — offline support + makes the app installable |
| `icon.svg`, `icon-maskable.svg` | Crisp vector icons (any size) |
| `icon-192.png`, `icon-512.png` | Raster icons for install & stores |
| `icon-maskable-512.png` | Android adaptive-icon source (safe-zone padded) |
| `apple-touch-icon.png` | iOS home-screen icon |
| `<head>` + install script in `index.html` | Links the manifest, registers `sw.js`, shows the Install button |

**After any deploy**, the service worker fetches the newest `index.html` whenever the phone is
online, so installed apps update themselves — no need to rebuild the APK for content changes.
Rebuild the APK only if you change the app **name, package id, or icons**.

---

## Troubleshooting

- **PWABuilder says “no service worker”** → make sure you opened the real `https://` link
  (not a `file://` path), and that `https://your-link/sw.js` loads in the browser.
- **Icon looks cut off on Android** → that’s the mask; it uses `icon-maskable-512.png`, which is
  already padded. If you replace the icons, keep the maskable one’s logo inside the centre ~80%.
- **Updates not showing in the installed app** → open it once while online; the service worker
  pulls the new version in the background and applies it on the next launch.
