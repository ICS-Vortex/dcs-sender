'use strict';

import {app, protocol, BrowserWindow, Menu} from 'electron';
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

app.on('ready', async () => {
    createWindow();
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

const template = [
    {
        label: 'Application',
        submenu: [
            {
                label: 'Reload',
                click: () => {
                    app.relaunch();
                    app.exit();
                },
            },
            { role: 'undo' },
            { role: 'redo' },
            { role: 'quit' }
        ]
    },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
