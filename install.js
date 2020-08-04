'use strict';

const path = require('path');
const fs = require('fs');
const extractZip = require('extract-zip');
const got = require('got');
const tmp = require('tmp');
const debug = require('debug')('node-chromium');
const rimraf = require('rimraf');

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

/**
 * Downloads the Chromium archive from the default CDN or mirror if configured.
 * If the required archive is retrieved from the cache directory then the download will be skipped.
 * @param {string} revision The Chromium revision to download.
 */
async function downloadChromiumRevision(revision) {
    const cacheEntry = cache.get(revision);
    if (cacheEntry) {
        debug('Found Chromium archive in cache, skipping download');

        return Promise.resolve(cacheEntry);
    }

    debug('Downloading Chromium archive from Google CDN');
    const url = utils.getDownloadUrl(revision);
    const tmpPath = await createTempFile();
    return _downloadFile(url, tmpPath).then(tmpPath => {
        cache.put(revision, tmpPath);
        return tmpPath;
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
        const osOutputFolder = path.join(outputFolder, utils.getOsChromiumFolderName());
        rimraf(osOutputFolder, () => {
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
    });
}

async function install() {
    const chromiumRevision = config.getEnvVar('NODE_CHROMIUM_REVISION');
    try {
        console.info('Step 1. Retrieving Chromium revision number');
        const revision = chromiumRevision || await utils.getLatestRevisionNumber();

        console.info(`Step 2. Downloading Chromium (this might take a while). Revision number: ${revision}`);
        const archivePath = await downloadChromiumRevision(revision);

        console.info('Step 3. Setting up Chromium binaries');
        await unzipArchive(archivePath, config.BIN_OUT_PATH);

        console.info('Process is successfully finished');
    } catch (error) {
        console.error('An error occurred while trying to setup Chromium. Resolve all issues and restart the process', error);
    }
}

if (require.main === module) {
    // Module called directly, not via "require", so execute install...
    install();
}

tmp.setGracefulCleanup(); // Ensure temporary files are cleaned up when process exits

module.exports = install;
