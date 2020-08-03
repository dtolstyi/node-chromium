'use strict';
const path = require('path');
const os = require('os');
const fs = require('fs');
const config = require('./config');

const CACHE_DIR = 'node-chromium';

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
    if (!revision || config.getEnvVar('CHROMIUM_CACHE_SKIP').toLowerCase() === 'true') {
        return '';
    }

    let cacheDir = config.getEnvVar('CHROMIUM_CACHE');
    if (!cacheDir) {
        switch (os.platform()) {
            case 'win32': {
                cacheDir = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData');
                cacheDir = path.join(cacheDir, CACHE_DIR, 'Cache');
                break;
            }

            case 'darwin': {
                cacheDir = path.join(os.homedir(), 'Library', 'Caches', CACHE_DIR);
                break;
            }

            case 'linux': {
                cacheDir = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache', CACHE_DIR);
                break;
            }

            default: {
                path.join(os.homedir(), `.${CACHE_DIR}`);
            }
        }
    }

    return path.join(cacheDir, `chromium-${revision}-${process.platform}-${process.arch}.zip`);
}

module.exports = {
    get,
    put
};
