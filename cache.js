'use strict';
const path = require('path');
const fs = require('fs');
const cachedir = require('cachedir');
const config = require('./config');

/**
 * Retrieve a Chromium archive from filesystem cache.
 * @param {string} revision The Chromium revision to retrieve.
 * @returns {string} The path to the cached Chromium archive. Falsy if not found.
 */
function get(revision) {
    const cachePath = buildCachePath(revision);
    if (fs.existsSync(cachePath)) {
        return cachePath;
    }

    return '';
}

/**
 * Store a Chromium archive in filesystem cache for future use.
 * Has no effect if the user has not configured a cache location.
 * @param {string} revision The Chromium revision in the archive file.
 * @param {string} filePath The path to the Chromium archive file to store in cache.
 */
function put(revision, filePath) {
    const cachePath = buildCachePath(revision);
    if (cachePath && filePath) {
        try {
            fs.mkdirSync(path.dirname(cachePath), {recursive: true});
            fs.copyFileSync(filePath, cachePath);
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
function buildCachePath(revision) {
    if (!revision || config.getEnvVar('NODE_CHROMIUM_CACHE_DISABLE').toLowerCase() === 'true') {
        return '';
    }

    const cachePath = config.getEnvVar('NODE_CHROMIUM_CACHE_PATH') || cachedir('node-chromium');
    return path.join(cachePath, `chromium-${revision}-${process.platform}-${process.arch}.zip`);
}

module.exports = {
    get,
    put
};
