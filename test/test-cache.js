'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const test = require('ava');
const testUtils = require('./_utils');
const cache = require('../cache');
let idx = 0;

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
    setCacheDir();
    t.pass();
});

test.afterEach(t => {
    testUtils.clearMocks();
    t.pass();
});

test.serial('match when not configured returns falsy', t => {
    delete process.env.CHROMIUM_CACHE;
    delete process.env.npm_config_chromium_cache;
    t.falsy(cache.match('737027'));
});

test.serial('match with null returns falsy', t => {
    t.falsy(cache.match(null));
});

test.serial('match with no hit returns falsy', t => {
    t.falsy(cache.match('foobar'));
});

test.serial('put and retrieve cached file when disabled', t => {
    delete process.env.CHROMIUM_CACHE;
    delete process.env.npm_config_chromium_cache;

    const revision = Date.now().toString();
    const file = createDummyFile();
    t.falsy(cache.match(revision), 'There should be no cached file before the test');
    cache.put(revision, file);
    t.falsy(cache.match(revision), 'There should still be no cached file');
});

test.serial('put and retrieve cached file', t => {
    const revision = Date.now().toString();
    const file = createDummyFile();
    t.falsy(cache.match(revision), 'There should be no cached file at this point');
    cache.put(revision, file);
    const fileContent = fs.readFileSync(file, 'utf8');
    const actualContent = fs.readFileSync(cache.match(revision), 'utf8');
    t.is(fileContent, actualContent, 'The cached file should match the source file');
});

test.serial('put and overwrite existing cached file', t => {
    const revision = Date.now().toString();
    const file = createDummyFile();
    t.falsy(cache.match(revision), 'There should be no cached file at this point');
    cache.put(revision, file);
    t.truthy(cache.match(revision), 'There should be a cached file at this point');
    cache.put(revision, file);
});

test.serial('cache entries for different platforms do not collide', t => {
    const revision = Date.now().toString();
    ['darwin', 'linux', 'windows'].forEach(platform => {
        testUtils.mockPlatform(platform);
        const file = createDummyFile();
        t.falsy(cache.match(revision), 'There should be no cached file at this point');
        cache.put(revision, file);
        const fileContent = fs.readFileSync(file, 'utf8');
        const actualContent = fs.readFileSync(cache.match(revision), 'utf8');
        t.is(fileContent, actualContent, 'The cached file should match the source file');
    });
});

test.serial('cache entries for different architectures do not collide', t => {
    const revision = Date.now().toString();
    ['x32', 'x64'].forEach(arch => {
        testUtils.mockArch(arch);
        const file = createDummyFile();
        t.falsy(cache.match(revision), 'There should be no cached file at this point');
        cache.put(revision, file);
        const fileContent = fs.readFileSync(file, 'utf8');
        const actualContent = fs.readFileSync(cache.match(revision), 'utf8');
        t.is(fileContent, actualContent, 'The cached file should match the source file');
    });
});

/**
 * Configures node-chromium to use a filesystem cache.
 */
function setCacheDir() {
    delete process.env.CHROMIUM_CACHE;
    delete process.env.npm_config_chromium_cache;
    const cacheDir = path.join(os.tmpdir(), 'chromium-cache');
    fs.mkdirSync(cacheDir, {recursive: true});
    process.env.CHROMIUM_CACHE = cacheDir;
    process.env.npm_config_chromium_cache = cacheDir;
    return cacheDir;
}

/**
 * Creates a text file which, for the purposes of the cache test, can be treated as a chromium binary,
 */
function createDummyFile() {
    const temporaryDir = os.tmpdir();
    const uid = `${Date.now()}_${idx++}`;
    const name = `${uid}.txt`;
    const filePath = path.join(temporaryDir, name);
    fs.writeFileSync(filePath, `Hello ${uid}`);
    return filePath;
}
