'use strict';

const path = require('path');
const got = require('got');

const config = require('./config');

const CDN_URL = 'https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/';

module.exports = {
    /**
     * Returns chromium output folder name for current OS
     *
     * @returns {string}
     */
    getOsChromiumFolderName() {
        const platform = process.platform;

        let archivePlatformPrefix = platform;

        if (platform === 'darwin') {
            archivePlatformPrefix = 'mac';
        } else if (platform === 'win32') {
            archivePlatformPrefix = 'win';
        }

        return `chrome-${archivePlatformPrefix}`;
    },

    /**
     * Returns path to Chromium executable binary where it's being downloaded
     *
     * @returns {string}
     */
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
            throw new Error('Unsupported platform');
        }

        return binPath;
    },

    /**
     * Returns full URL where Chromium can be found for current OS
     *
     * @param revision - Chromium revision
     *
     * @returns {string}
     */
    getDownloadUrl(revision) {
        return `${this.getOsCdnUrl()}%2F${revision}%2F${this.getOsChromiumFolderName()}.zip?alt=media`;
    },

    /**
     * Returns CDN Url according to current OS
     *
     * @returns {string}
     */
    getOsCdnUrl() {
        let url = CDN_URL;

        const platform = process.platform;

        if (platform === 'linux') {
            url += 'Linux';
            if (process.arch === 'x64') {
                url += '_x64';
            }
        } else if (platform === 'win32') {
            url += 'Win';
            if (process.arch === 'x64') {
                url += '_x64';
            }
        } else if (platform === 'darwin') {
            url += 'Mac';
        } else {
            throw new Error('Unsupported platform');
        }

        return url;
    },

    /**
     * Retrieves latest available Chromium revision number string for current OS
     *
     * @returns {Promise<String>}
     */
    async getLatestRevisionNumber() {
        const url = this.getOsCdnUrl() + '%2FLAST_CHANGE?alt=media';
        return (await got(url)).body;
    }
};
