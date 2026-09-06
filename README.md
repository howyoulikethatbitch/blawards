# BL Awards

BL Awards is a private, local-first Electron application for maintaining a personal BL archive and running cinematic annual awards ceremonies.

## Development

The renderer preview runs through Vite:

```bash
pnpm install
pnpm dev
```

The Electron shell can be started locally with:

```bash
pnpm electron:dev
```

## Windows releases

Windows releases are produced by GitHub Actions from semantic version tags. A normal push to GitHub does **not** create a desktop release.

The exact local build command is:

```bash
pnpm install
pnpm build
pnpm exec electron-builder --win nsis --publish never
```

The convenience script is equivalent:

```bash
pnpm dist
```

The Windows x64 NSIS installer and updater metadata are written to `release/`:

- `BL Awards Setup <version>.exe`
- `latest.yml`
- the generated `.blockmap` file

To publish a release:

```bash
git add .
git commit -m "Release v0.1.0"
git push
git tag v0.1.0
git push origin v0.1.0
```

The workflow in `.github/workflows/release.yml` supports manually tagged releases. The main-branch workflow in `.github/workflows/build-windows.yml` is the normal path for this app: it automatically creates a patch version from the workflow run number, packages the NSIS installer, and publishes the GitHub Release using the standard `github.token`.

Both workflows apply their release version before packaging, so the installer version and `latest.yml` stay aligned. No manual version tag is required for normal pushes to `main`.

## Updates

`electron-updater` is configured with the GitHub provider for `howyoulikethatbitch/blawards`. Packaged Windows builds check for releases after launch, show an in-app update prompt, support download progress, allow the user to defer, and offer restart-and-install when ready.

An installed app checks for an update after the main-branch workflow has finished publishing its automatically versioned GitHub Release. It checks shortly after launch and periodically while open, so syncing source files alone does not make an update available; the workflow must complete successfully first.

Updates do not recreate or clear `bl_awards_db`. User titles, images, evaluations, awards, and Hall of Fame data remain in the local IndexedDB profile. Future schema changes should use Dexie migrations.

The current release is intentionally unsigned. For a production distribution without SmartScreen warnings, configure a Windows code-signing certificate in GitHub Actions; no signing secret is required for the current workflow to build an installer.

## Replit preview

Replit runs `pnpm dev` on port 5000 for the renderer preview. The preview is useful for the application UI; the permanent Windows installer is produced by the tag-based GitHub Actions workflow.