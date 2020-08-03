'use strict';

const fs = require('fs');
const extractZip = require('extract-zip');
const got = require('got');
const tmp = require('tmp');
const debug = require('debug')('node-chromium');
const ProgressBar = require('progress');

const config = require('./config');
const utils = require('./utils');

let progressBar = null;

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

    debug('Downloading Chromium archive from Google CDN');
    const url = utils.getDownloadUrl(revision);

    return _downloadFile(url, tmpPath);
}

function _downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        got.stream(url, utils.getRequestOptions(url))
            .on('downloadProgress', onProgress)
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

/**
 * Handles download progress events.
 * @param progress Information about progress so far.
 */
function onProgress(progress) {
    try {
        if (!progressBar) {
            const formatBytes = bytes => {
                const mb = bytes / 1024 / 1024;
                return `${Math.round(mb * 10) / 10} MB`;
            };

            progressBar = new ProgressBar(`Downloading Chromium - ${formatBytes(progress.total)} [:bar] :percent :etas `, {
                width: 20,
                total: progress.total
            });
        }

        progressBar.tick(progress.transferred - progressBar.curr);
    } catch (error) {
        // Don't die on progress bar failure, log it and stop progress
        console.error('Error displaying progress bar. Continuing anyway...', error);
        progressBar = {tick: () => {}};
    }
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

        console.info(`Step 2. Downloading Chromium revision ${revision}`);
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
