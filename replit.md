# BL Awards

BL Awards is a private, local-first desktop application for maintaining a personal BL archive and running annual awards ceremonies.

## Stack

- Electron shell with secure `contextIsolation` and a preload bridge
- React + TypeScript + Vite
- Dexie.js over IndexedDB (`bl_awards_db`)
- React Router, Framer Motion, Lucide React, Sonner
- Tailwind CSS is available for utility styling; the primary UI styles live in `src/styles.css`

## Running the project

The Replit preview runs the renderer as a Vite web application:

```bash
pnpm install
pnpm dev
```

The packaged desktop build can be prepared with:

```bash
pnpm dist
```

`pnpm dist` builds the renderer and packages an unsigned Windows x64 NSIS installer into `release/` without publishing. Permanent tagged releases use the GitHub Actions workflow with Electron Builder's `--publish onTag` mode so updater metadata is uploaded with the release; see `README.md` and `.github/workflows/release.yml`.

For local Electron development, start Vite and Electron together:

```bash
pnpm electron:dev
```

The app seeds a small sample archive on the first run to demonstrate the derived views. All changes are stored locally in IndexedDB; no account, cloud database, or external service is required.

## Updates

Packaged Windows builds use `electron-updater` with the GitHub provider configured for `howyoulikethatbitch/blawards`. Update checks and downloads are non-blocking and do not touch the local IndexedDB profile.