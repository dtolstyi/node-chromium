'use strict';

import test from 'ava';

const config = require('../config');
const utils = require('../utils');

const OVERRIDE_URL = 'http://example.com/chromium-browser-snapshots/';

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
    process.env = {};  // Prevent the real environment from interfering with these tests
    t.pass();
});

test.serial('getDownloadUrl uses default', t => {
    const url = utils.getDownloadUrl('737027');
    t.true(url.indexOf(config.CDN_URL) === 0, `By default the URL should download from ${config.CDN_URL} but got ${url}`);
});

test.serial('getDownloadUrl contains revision', t => {
    const revision = '737027';
    const url = utils.getDownloadUrl(revision);
    t.true(url.indexOf(revision) > 0, `Expected revision ${revision} in ${url}`);
});

test.serial('getDownloadUrl honors environment variable', t => {
    process.env.CHROMIUM_DOWNLOAD_HOST = OVERRIDE_URL;

    const url = utils.getDownloadUrl('737027');
    t.true(url.indexOf(OVERRIDE_URL) === 0, `Download URL should honor environment variable ${OVERRIDE_URL} but got ${url}`);
});

test.serial('getDownloadUrl honors npm config', t => {
    process.env.npm_config_chromium_download_host = OVERRIDE_URL;

    const url = utils.getDownloadUrl('737027');
    t.true(url.indexOf(OVERRIDE_URL) === 0, `Download URL should honor npm config ${OVERRIDE_URL} but got ${url}`);
});
