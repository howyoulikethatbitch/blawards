const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("blAwards", {
  platform: process.platform,
  version: process.env.npm_package_version || "0.1.0",
  updater: {
    check: () => ipcRenderer.invoke("updater-check"),
    download: () => ipcRenderer.invoke("updater-download"),
    install: () => ipcRenderer.invoke("updater-install"),
    onStatus: (listener) => {
      const handler = (_event, status) => listener(status);
      ipcRenderer.on("updater-status", handler);
      return () => ipcRenderer.removeListener("updater-status", handler);
    },
  },
});