var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './dist_electron/win-unpacked',
    outputDirectory: './release/installer',
    authors: 'Me',
    exe: 'MyAwesomeApp.exe'
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));