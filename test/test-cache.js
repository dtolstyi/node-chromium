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

test.serial('get with null returns falsy', t => {
    t.falsy(cache.get(null));
});

test.serial('get with no hit returns falsy', t => {
    t.falsy(cache.get('foobar'));
});

test.serial('put and retrieve cached file when disabled', t => {
    process.env.NODE_CHROMIUM_CACHE_DISABLE = 'true';
    const revision = Date.now().toString();
    const file = createDummyFile();
    t.falsy(cache.get(revision), 'There should be no cached file before the test');
    cache.put(revision, file);
    t.falsy(cache.get(revision), 'There should still be no cached file');
});

test.serial('put and retrieve cached file', t => {
    const revision = Date.now().toString();
    const file = createDummyFile();
    t.falsy(cache.get(revision), 'There should be no cached file at this point');
    cache.put(revision, file);
    const fileContent = fs.readFileSync(file, 'utf8');
    const actualContent = fs.readFileSync(cache.get(revision), 'utf8');
    t.is(fileContent, actualContent, 'The cached file should match the source file');
});

test.serial('put and overwrite existing cached file', t => {
    const revision = Date.now().toString();
    const file = createDummyFile();
    t.falsy(cache.get(revision), 'There should be no cached file at this point');
    cache.put(revision, file);
    t.truthy(cache.get(revision), 'There should be a cached file at this point');
    cache.put(revision, file); // Nothing bad should happen
});

test.serial('cache entries for different platforms do not collide', t => {
    const revision = Date.now().toString();
    ['darwin', 'linux', 'windows'].forEach(platform => {
        testUtils.mockPlatform(platform);
        const file = createDummyFile();
        t.falsy(cache.get(revision), 'There should be no cached file at this point');
        cache.put(revision, file);
        const fileContent = fs.readFileSync(file, 'utf8');
        const actualContent = fs.readFileSync(cache.get(revision), 'utf8');
        t.is(fileContent, actualContent, 'The cached file should match the source file');
    });
});

test.serial('cache entries for different architectures do not collide', t => {
    const revision = Date.now().toString();
    ['x32', 'x64'].forEach(arch => {
        testUtils.mockArch(arch);
        const file = createDummyFile();
        t.falsy(cache.get(revision), 'There should be no cached file at this point');
        cache.put(revision, file);
        const fileContent = fs.readFileSync(file, 'utf8');
        const actualContent = fs.readFileSync(cache.get(revision), 'utf8');
        t.is(fileContent, actualContent, 'The cached file should match the source file');
    });
});

/**
 * Configures node-chromium to use a filesystem cache.
 */
function setCacheDir() {
    const cacheDir = path.join(os.tmpdir(), 'chromium-cache');
    fs.mkdirSync(cacheDir, {recursive: true});
    testUtils.setEnvVar('NODE_CHROMIUM_CACHE_PATH', cacheDir);
    testUtils.clearEnvVar('NODE_CHROMIUM_CACHE_DISABLE');
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
