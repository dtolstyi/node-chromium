'use strict';

const test = require('ava');

const fs = require('fs');
const rimraf = require('rimraf');
const got = require('got');
const debug = require('debug')('node-chromium');

const testUtils = require('./_utils');
const utils = require('../utils');
const config = require('../config');
const install = require('../install');

test.before(t => {
    // Deleting output folder
    const outPath = config.BIN_OUT_PATH;
    debug(`Deleting output folder: [${outPath}]`);

    if (fs.existsSync(outPath)) {
        rimraf.sync(outPath);
    }

    t.pass();
});

test.afterEach(t => {
    testUtils.clearMocks();
    t.pass();
});

test.serial('Canary Test', t => {
    t.pass();
});

test.serial('Before Install Process', t => {
    const binPath = utils.getOsChromiumBinPath();
    t.false(fs.existsSync(binPath), `Chromium binary is found in: [${binPath}]`);
});

test.serial('Chromium Install', async t => {
    await install();
    const binPath = utils.getOsChromiumBinPath();
    const isExists = fs.existsSync(binPath);
    t.true(isExists, `Chromium binary is not found in: [${binPath}]`);
});

test.serial('Different OS support', async t => {
    const supportedPlatforms = ['darwin', 'linux', 'win32'];
    const notSupportedPlatforms = ['aix', 'freebsd', 'openbsd', 'sunos'];

    /* eslint-disable no-await-in-loop */
    for (const platform of supportedPlatforms) {
        testUtils.mockPlatform(platform);

        const revision = await utils.getLatestRevisionNumber();

        const url = utils.getDownloadUrl(revision);
        t.true(await isUrlAccessible(url));
    }
    /* eslint-enable no-await-in-loop */

    for (const platform of notSupportedPlatforms) {
        testUtils.mockPlatform(platform);

        t.throws(() => {
            utils.getDownloadUrl();
        }, {message: 'Unsupported platform'});
    }

    t.pass();
});

async function isUrlAccessible(url) {
    try {
        const response = await got(url, {method: 'HEAD'});
        return /4\d\d/.test(response.statusCode) === false;
    } catch (error) {
        console.warn(`An error [${error.message}] occurred while trying to check URL [${url}] accessibility`);
        return false;
    }
}
