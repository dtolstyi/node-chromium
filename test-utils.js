'use strict';

import test from 'ava';

const config = require('./config');
const utils = require('./utils');

const CDN_URL = 'https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/';
const ALT_URL = 'https://npm.taobao.org/mirrors/chromium-browser-snapshots/';

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
    // Ensure a consistent, known environment reset for each test
    config._setEnv({});

    t.pass();
});

test.serial('getDownloadUrl uses default', t => {
    const url = utils.getDownloadUrl('737027');
    t.true(url.indexOf(CDN_URL) === 0, `By default the URL should download from ${CDN_URL} but got ${url}`);
});

test.serial('getDownloadUrl contains revision', t => {
    const revision = '737027';
    const url = utils.getDownloadUrl(revision);
    t.true(url.indexOf(revision) > 0, `Expected revision ${revision} in ${url}`);
});

test.serial('getDownloadUrl honors environment variable', t => {
    config._setEnv({
        CHROMIUM_DOWNLOAD_HOST: ALT_URL
    });
    const url = utils.getDownloadUrl('737027');
    t.true(url.indexOf(ALT_URL) === 0, `Download URL should honor environment variable ${ALT_URL} but got ${url}`);
});

test.serial('getDownloadUrl honors npm config', t => {
    config._setEnv({
        npm_config_chromium_download_host: ALT_URL
    });
    const url = utils.getDownloadUrl('737027');
    t.true(url.indexOf(ALT_URL) === 0, `Download URL should honor npm config ${ALT_URL} but got ${url}`);
});
