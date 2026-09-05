const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");

const isDev = !app.isPackaged;
let mainWindow;

function sendUpdaterStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater-status", status);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#111113",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function configureUpdater() {
  if (isDev || process.platform !== "win32") return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("checking-for-update", () => sendUpdaterStatus({ state: "checking" }));
  autoUpdater.on("update-available", (info) => {
    sendUpdaterStatus({ state: "available", version: info.version });
  });
  autoUpdater.on("update-not-available", () => sendUpdaterStatus({ state: "current" }));
  autoUpdater.on("download-progress", (progress) => {
    sendUpdaterStatus({ state: "downloading", percent: Math.round(progress.percent) });
  });
  autoUpdater.on("update-downloaded", (info) => {
    sendUpdaterStatus({ state: "downloaded", version: info.version });
  });
  autoUpdater.on("error", (error) => {
    console.error("BL Awards updater error:", error);
    sendUpdaterStatus({ state: "error" });
  });

  ipcMain.handle("updater-check", async () => {
    try {
      await autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (error) {
      console.error("BL Awards update check failed:", error);
      sendUpdaterStatus({ state: "error" });
      return { ok: false };
    }
  });
  ipcMain.handle("updater-download", async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (error) {
      console.error("BL Awards update download failed:", error);
      sendUpdaterStatus({ state: "error" });
      return { ok: false };
    }
  });
  ipcMain.handle("updater-install", () => {
    autoUpdater.quitAndInstall(false, true);
    return { ok: true };
  });
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline'; connect-src 'self' https:;",
        ],
      },
    });
  });
  createWindow();
  configureUpdater();
  if (!isDev && process.platform === "win32") {
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => undefined), 2500);
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});