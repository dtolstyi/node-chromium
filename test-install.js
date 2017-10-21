'use strict';

import test from 'ava';

const fs = require('fs');
const rimraf = require('rimraf');

const utils = require('./utils');
const config = require('./config');
const chromium = require('./install');

test.before(t => {
    // Deleting output folder
    const outPath = config.BIN_OUT_PATH;
    console.log(`Deleting output folder: [${outPath}]`);

    if (fs.existsSync(outPath)) {
        rimraf.sync(outPath);
    }
    t.pass();
});

test('Canary Test', t => {
    t.pass();
});

test('Before Install Process', t => {
    const binPath = utils.getOsChromiumBinPath();
    t.false(fs.existsSync(binPath), `Chromium binary is found in: [${binPath}]`);
});

test('Chromium Install', async t => {
    await chromium.then(() => {
        const binPath = utils.getOsChromiumBinPath();
        t.true(fs.existsSync(binPath), `Chromium binary is not found in: [${binPath}]`);
    });
});
