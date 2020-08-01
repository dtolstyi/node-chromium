'use strict';

const fs = require('fs');
const extractZip = require('extract-zip');
const got = require('got');
const tmp = require('tmp');
const debug = require('debug')('node-chromium');

const config = require('./config');
const utils = require('./utils');
const cache = require('./cache');

/* eslint unicorn/prevent-abbreviations: ["off"] */

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

async function downloadChromiumRevision(revision) {
    const tmpPath = await createTempFile();
    const cacheEntry = cache.match(revision);
    if (cacheEntry) {
        debug('Found Chromium archive in cache, skipping download');
        fs.copyFileSync(cacheEntry, tmpPath);

        return Promise.resolve(tmpPath);
    }

    debug('Downloading Chromium archive from Google CDN');
    const url = utils.getDownloadUrl(revision);

    return _downloadFile(url, tmpPath).then(destPath => {
        cache.put(revision, destPath);
        return destPath;
    });
}

function _downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        got.stream(url, utils.getRequestOptions(url))
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

async function install() {
    const chromiumRevision = config.getEnvVar('CHROMIUM_REVISION');
    try {
        console.info('Step 1. Retrieving Chromium revision number');
        const revision = chromiumRevision || await utils.getLatestRevisionNumber();

        console.info(`Step 2. Downloading Chromium (this might take a while). Revision number: ${revision}`);
        const tmpPath = await downloadChromiumRevision(revision);

        console.info('Step 3. Setting up Chromium binaries');
        await unzipArchive(tmpPath, config.BIN_OUT_PATH);

        console.info('Process is successfully finished');
    } catch (error) {
        console.error('An error occurred while trying to setup Chromium. Resolve all issues and restart the process', error);
    }
}

if (require.main === module) {
    // Module called directly, not via "require", so execute install...
    install();
}

module.exports = install;
