'use strict';

const config = require('./config');

const path = require('path');

module.exports = {
    getOsChromiumFolderName: function() {
        const platform = process.platform;

        let archivePlatformPrefix = platform;

        if (platform === 'darwin') {
            archivePlatformPrefix = 'mac';
        }

        return `chrome-${archivePlatformPrefix}`;
    },

    getOsChromiumBinPath: function() {
        let binPath = path.join(config.BIN_OUT_PATH, this.getOsChromiumFolderName());

        const platform = process.platform;

        if (platform === 'linux') {
            binPath = path.join(binPath, 'chrome');
        } else if (platform === 'win32') {
            binPath = path.join(binPath, 'chrome.exe');
        } else if (platform === 'darwin') {
            binPath = path.join(binPath, 'Chromium.app/Contents/MacOS/Chromium');
        } else {
            console.log('Unsupported platform or architecture found:', process.platform, process.arch);
            process.exit(1);
        }

        return binPath;
    }
};
