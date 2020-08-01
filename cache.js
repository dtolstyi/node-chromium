'use strict';
const path = require('path');
const fs = require('fs');
const config = require('./config');

/**
 * Retrieve a Chromium archive from filesystem cache.
 * @param {string} revision The Chromium revision to retrieve.
 * @returns {string} The path to the cached Chromium archive. Falsy if not found.
 */
function match(revision) {
    const cachePath = getCachePath(revision);
    if (fs.existsSync(cachePath)) {
        return cachePath;
    }

    return '';
}

/**
 * Store a Chromium archive in filesystem cache for future use.
 * Has no effect if the user has not configured a cache location.
 * @param {string} revision The Chromium revision in the archive file.
 * @param {string} file The path to the Chromium archive file to store in cache.
 */
function put(revision, file) {
    const cachePath = getCachePath(revision);
    if (cachePath && file) {
        try {
            fs.mkdirSync(path.dirname(cachePath), {recursive: true});
            fs.copyFileSync(file, cachePath);
        } catch (error) {
            // Don't die on cache fail
            console.error('Could not cache file', cachePath, error);
        }
    }
}

/**
 * Get the unique cache path for this revision, on this platform and architecture.
 * @param {string} revision The revision of this Chromium binary, essentially a unique cache key.
 * @returns {string} The cache path, or falsy if caching is not enabled.
 */
function getCachePath(revision) {
    const cacheDir = config.getEnvVar('CHROMIUM_CACHE');

    if (!revision || !cacheDir) {
        return '';
    }

    return path.join(cacheDir, process.platform, revision, `${process.arch}.zip`);
}

module.exports = {
    match,
    put
};
