'use strict';

import {app, protocol, BrowserWindow, dialog, nativeImage} from 'electron';
import log from 'electron-log';
import { autoUpdater } from "electron-updater";
import {
    createProtocol
} from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production';
let win;

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}]);

function createWindow() {
    let image = nativeImage.createFromPath(__dirname + '/public/logo.png');
    image.setTemplateImage(true);
    let options = {
        width: 1200,
        height: 600,
        icon: image,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    };

    if ((process.env.NODE_ENV || 'development') === 'development') {
        options.webPreferences.devTools = true;
    }
    win = new BrowserWindow(options);

    win.setMenu(null);
    win.maximize();
    win.setFullScreen(false);
    win.webContents.openDevTools(); //TODO remove
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) {
            win.webContents.openDevTools();
        }
    } else {
        createProtocol('app');
        win.loadURL('app://./index.html');
    }
    win.on('closed', () => {
        win = null;
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    if (win === null) {
        createWindow();
    }
});

app.on('ready', () => {
    createWindow();
    setInterval(() => {
        autoUpdater.checkForUpdates().then(data => {
            log.info(data.updateInfo.releaseNotes);
        });
    }, 1000 * 15);
});

if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
});

autoUpdater.on('update-available', () => {
   autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', () => {
    log.info('Update not available.');
});

autoUpdater.on('error', (err) => {
    log.info('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});
