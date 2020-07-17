'use strict';

import {app, protocol, BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import { autoUpdater } from "electron-updater";
import path from 'path';
import {
    createProtocol
} from 'vue-cli-plugin-electron-builder/lib';
const isDevelopment = process.env.NODE_ENV !== 'production';
let win;

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}]);

function createWindow() {
    let options = {
        width: 1200,
        height: 600,
        icon:  path.join(__dirname, '/assets/logo.png'),
        webPreferences: {
            devTools: true,
            nodeIntegration: true
        }
    };

    if ((process.env.NODE_ENV || 'development') === 'development') {
        options.webPreferences.devTools = true;
    }
    win = new BrowserWindow(options);
    win.setMenu(null);
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools()
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

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

app.on('ready', () => {
    createWindow();
    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
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

function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', () => {
    sendStatusToWindow('Update available.');
    dialog.showMessageBox({
        type: 'info',
        message: 'Update available',
        title: 'DCS Sender Updater',
    });
})

autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', () => {
    //progressObj
    // let log_message = "Download speed: " + progressObj.bytesPerSecond;
    // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    // sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow('Update downloaded');
});
