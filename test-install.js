'use strict';

import test from 'ava';

const fs = require('fs');
const rimraf = require('rimraf');
const got = require('got');
const debug = require('debug')('node-chromium');

const utils = require('./utils');
const config = require('./config');

const install = async () => {
    await require('./install');
};

test.before(t => {
    // Deleting output folder
    const outPath = config.BIN_OUT_PATH;
    debug(`Deleting output folder: [${outPath}]`);

    if (fs.existsSync(outPath)) {
        rimraf.sync(outPath);
    }
    t.pass();
});

test.serial('Canary Test', t => {
    t.pass();
});

test('Before Install Process', t => {
    const binPath = utils.getOsChromiumBinPath();
    t.false(fs.existsSync(binPath), `Chromium binary is found in: [${binPath}]`);
});

test('Chromium Install', async t => {
    await install();

    const binPath = utils.getOsChromiumBinPath();
    const isExists = fs.existsSync(binPath);
    t.true(isExists, `Chromium binary is not found in: [${binPath}]`);
});

test.serial('Different OS support', async t => {
    const supportedPlatforms = ['darwin', 'linux', 'win32'];
    const notSupportedPlatforms = ['aix', 'freebsd', 'openbsd', 'sunos'];

    const originalPlatform = process.platform;

    for (const platform of supportedPlatforms) {
        mockPlatform(platform);

        const revision = await utils.getLatestRevisionNumber();

        const url = utils.getDownloadUrl(revision);
        t.true(await isUrlAccessible(url));
    }

    for (const platform of notSupportedPlatforms) {
        mockPlatform(platform);

        t.throws(() => {
            utils.getDownloadUrl();
        }, 'Unsupported platform');
    }

    mockPlatform(originalPlatform);

    t.pass();
});

async function isUrlAccessible(url) {
    try {
        const response = await got(url, {method: 'HEAD'});
        return /4\d\d/.test(response.statusCode) === false;
    } catch (err) {
        console.warn(`An error [${err.message}] occurred while trying to check URL [${url}] accessibility`);
        return false;
    }
}

function mockPlatform(newPlatformValue) {
    Object.defineProperty(process, 'platform', {
        value: newPlatformValue
    });
}
