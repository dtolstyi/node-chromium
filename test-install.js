'use strict';

import test from 'ava';

const fs = require('fs');
const rimraf = require('rimraf');
const debug = require('debug')('node-chromium');

const utils = require('./utils');
const config = require('./config');

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

test('Chromium Install', t => {
    return require('./install').then(() => {
        const binPath = utils.getOsChromiumBinPath();
        const isExists = fs.existsSync(binPath);
        t.true(isExists, `Chromium binary is not found in: [${binPath}]`);
    });
});
