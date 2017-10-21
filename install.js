'use strict';

const fs = require('fs');
const extractZip = require('extract-zip');
const got = require('got');
const tmp = require('tmp');

const config = require('./config');
const utils = require('./utils');

const CDN_URL = 'https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/';

function getOsCdnUrl() {
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
        console.log('Unknown platform or architecture found:', process.platform, process.arch);
        throw new Error('Unsupported platform');
    }

    return url;
}

function getLatestRevisionNumber() {
    return new Promise((resolve, reject) => {
        const url = getOsCdnUrl() + '%2FLAST_CHANGE?alt=media';
        got(url)
            .then(response => {
                resolve(response.body);
            })
            .catch(err => {
                console.log('An error occured while trying to retrieve latest revision number', err);
                reject(err);
            });
    });
}

function createTempFile() {
    return new Promise((resolve, reject) => {
        tmp.file((error, path) => {
            if (error) {
                console.log('An error occured while trying to create temporary file', error);
                reject(error);
            } else {
                resolve(path);
            }
        });
    });
}

function downloadChromiumRevision(revision) {
    return new Promise((resolve, reject) => {
        createTempFile()
            .then(path => {
                console.log('Downloading Chromium archive from Google CDN');
                const url = getOsCdnUrl() + `%2F${revision}%2F` + utils.getOsChromiumFolderName() + '.zip?alt=media';
                got.stream(url)
                    .on('error', error => {
                        console.log('An error occurred while trying to download Chromium archive', error);
                        reject(error);
                    })
                    .pipe(fs.createWriteStream(path))
                    .on('error', error => {
                        console.log('An error occurred while trying to save Chromium archive to disk', error);
                        reject(error);
                    })
                    .on('finish', () => {
                        resolve(path);
                    });
            });
    });
}

function unzipArchive(archivePath, outputFolder) {
    console.log('Started extracting archive', archivePath);
    return new Promise((resolve, reject) => {
        extractZip(archivePath, {dir: outputFolder}, error => {
            if (error) {
                console.log('An error occurred while trying to extract archive', error);
                reject(error);
            } else {
                console.log('Archive was successfully extracted');
                resolve(true);
            }
        });
    });
}

module.exports = getLatestRevisionNumber()
    .then(downloadChromiumRevision)
    .then(path => unzipArchive(path, config.BIN_OUT_PATH))
    .catch(err => console.error('An error occurred while trying to setup Chromium. Resolve all issues and restart the process', err));

