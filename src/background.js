'use strict';

import {app, protocol, BrowserWindow, dialog, nativeImage} from 'electron';
import log from 'electron-log';
import { autoUpdater } from "electron-updater";
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production';
let win, updatesInterval;

const pjson = require('../package.json')
let appversion = pjson.version;

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}]);

const createWindow = () => {
    let image = nativeImage.createFromPath(__dirname + '/public/logo.png');
    image.setTemplateImage(true);
    let options = {
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
    // win.webContents.openDevTools(); //TODO remove
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
    updatesInterval = setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 1000 * 60 * 10); // Check updates every 1 minutes
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
    sendStatusToWindow('Checking for update...', appversion);
})

autoUpdater.on('update-available', () => {
    clearInterval(updatesInterval);
    sendStatusToWindow('Update available.', appversion);
});
autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Update not available.', appversion);
})

autoUpdater.on('error', (err) => {
    log.info('Error in auto-updater:' + err.message);
    sendStatusToWindow('Error in auto-updater. ' + err, appversion);
});

const  sendStatusToWindow = (text, ver) => {
    log.info(text);
    win.webContents.send('message', text, ver);
}

autoUpdater.on('download-progress', (progressObj) => {
    win.setProgressBar(progressObj.percent);
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message, appversion);
})

autoUpdater.on('update-downloaded', () => {
    clearInterval(updatesInterval);
    dialog.showMessageBox({
        title: 'DCS Stats Sender',
        message: 'Do you want to install updates?',
        buttons: ['Install updates', 'Cancel']
    }).then(data => {
        const {response} = data;
        if (response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('download-progress', (progressObj) => {
    win.setProgressBar(progressObj.percent);
})