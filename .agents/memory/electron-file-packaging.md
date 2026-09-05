---
name: Electron file packaging
description: Constraints for loading the Vite renderer from a packaged Electron file URL.
---

Packaged Electron builds must emit relative Vite asset URLs and use hash routing when the renderer is loaded from `file://`; the browser preview can keep normal browser routing.

**Why:** Root-relative assets point at the Windows drive root in a packaged app, and browser history routes do not map reliably to files on disk.

**How to apply:** Keep the Vite base relative and select the router from `window.location.protocol` so development URLs remain clean without breaking installed builds.