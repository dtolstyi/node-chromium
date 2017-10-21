'use strict';

const path = require('path');

const config = require('./config');

module.exports = {
    getOsChromiumFolderName() {
        const platform = process.platform;

        let archivePlatformPrefix = platform;

        if (platform === 'darwin') {
            archivePlatformPrefix = 'mac';
        }

        return `chrome-${archivePlatformPrefix}`;
    },

    getOsChromiumBinPath() {
        let binPath = path.join(config.BIN_OUT_PATH, this.getOsChromiumFolderName());

        const platform = process.platform;

        if (platform === 'linux') {
            binPath = path.join(binPath, 'chrome');
        } else if (platform === 'win32') {
            binPath = path.join(binPath, 'chrome.exe');
        } else if (platform === 'darwin') {
            binPath = path.join(binPath, 'Chromium.app/Contents/MacOS/Chromium');
        } else {
            console.error('Unsupported platform or architecture found:', process.platform, process.arch);
            throw new Error('Unsupported platform');
        }

        return binPath;
    }
};
