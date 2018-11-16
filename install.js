'use strict';

const fs = require('fs');
const extractZip = require('extract-zip');
const got = require('got');
const tmp = require('tmp');
const debug = require('debug')('node-chromium');

const config = require('./config');
const utils = require('./utils');

function createTempFile() {
    return new Promise((resolve, reject) => {
        tmp.file((error, path) => {
            if (error) {
                console.error('An error occured while trying to create temporary file', error);
                reject(error);
            } else {
                resolve(path);
            }
        });
    });
}

function downloadChromiumRevision(revision) {
    return createTempFile()
        .then(tmpFilePath => {
            debug('Downloading Chromium archive from Google CDN');
            const url = utils.getDownloadUrl(revision);

            return _downloadFile(url, tmpFilePath);
        });
}

function _downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        console.info('Downloading Chromium archive from CDN (this process might take a while)');
        got.stream(url)
            .on('error', error => {
                console.error('An error occurred while trying to download file', error.message);
                reject(error);
            })
            .pipe(fs.createWriteStream(destPath))
            .on('error', error => {
                console.error('An error occurred while trying to save file to disk', error);
                reject(error);
            })
            .on('finish', () => {
                resolve(destPath);
            });
    });
}

function unzipArchive(archivePath, outputFolder) {
    debug('Started extracting archive', archivePath);

    return new Promise((resolve, reject) => {
        extractZip(archivePath, {dir: outputFolder}, error => {
            if (error) {
                console.error('An error occurred while trying to extract archive', error);
                reject(error);
            } else {
                debug('Archive was successfully extracted');
                resolve(true);
            }
        });
    });
}

function install() {
    return utils.getLatestRevisionNumber()
        .then(downloadChromiumRevision)
        .then(downloadPath => unzipArchive(downloadPath, config.BIN_OUT_PATH))
        .then(() => console.info('Process is successfully finished'))
        .catch(err => console.error('An error occurred while trying to setup Chromium. Resolve all issues and restart the process', err));
}

module.exports = install();
