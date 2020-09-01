'use strict';

const path = require('path');
const got = require('got');
const tunnel = require('tunnel');

const config = require('./config');

module.exports = {
    /**
     * Returns chromium output folder name for current OS
     *
     * @returns {string}
     */
    getOsChromiumFolderName() {
        const platform = process.platform;

        let archivePlatformPrefix = platform;

        if (platform === 'darwin') {
            archivePlatformPrefix = 'mac';
        } else if (platform === 'win32') {
            archivePlatformPrefix = 'win';
        }

        return `chrome-${archivePlatformPrefix}`;
    },

    /**
     * Returns path to Chromium executable binary where it's being downloaded
     *
     * @returns {string}
     */
    getOsChromiumBinPath() {
        let binPath = path.join(config.BIN_OUT_PATH, this.getOsChromiumFolderName());

        const platform = process.platform;

        if (platform === 'linux') {
            binPath = path.join(binPath, 'chrome');
        } else if (platform === 'win32') {
            binPath = path.join(binPath, 'chrome.exe');
        } else if (platform === 'darwin') {
            binPath = path.join(binPath, 'Chromium.app/Contents/MacOS/Chromium');
        } else {
            throw new Error('Unsupported platform');
        }

        return binPath;
    },

    /**
     * Returns full URL where Chromium can be found for current OS
     *
     * @param revision - Chromium revision
     *
     * @returns {string}
     */
    getDownloadUrl(revision) {
        const altUrl = config.getEnvVar('NODE_CHROMIUM_DOWNLOAD_HOST');
        let revisionPath = `/${revision}/${this.getOsChromiumFolderName()}`;
        if (!altUrl) {
            revisionPath = encodeURIComponent(revisionPath); // Needed for googleapis.com
        }

        return `${this.getOsCdnUrl()}${revisionPath}.zip?alt=media`;
    },

    /**
     * Returns download Url according to current OS
     *
     * @returns {string}
     */
    getOsCdnUrl() {
        let url = config.getEnvVar('NODE_CHROMIUM_DOWNLOAD_HOST') || config.CDN_URL;

        const platform = process.platform;

        if (platform === 'linux') {
            url += 'Linux';
            if (process.arch === 'x64') {
                url += '_x64';
            }
        } else if (platform === 'win32') {
            url += 'Win';
            if (process.arch === 'x64') {
                url += '_x64';
            }
        } else if (platform === 'darwin') {
            url += 'Mac';
        } else {
            throw new Error('Unsupported platform');
        }

        return url;
    },

    /**
     * Retrieves latest available Chromium revision number string for current OS
     *
     * @returns {Promise<String>}
     */
    async getLatestRevisionNumber() {
        const url = this.getOsCdnUrl() + '%2FLAST_CHANGE?alt=media';
        return (await got(url, this.getRequestOptions(url))).body;
    },

    /**
     * Computes necessary configuration options for use with *got*. For the time being this only considers proxy settings.
     * @param url the target URL
     * @returns {Object}
     */
    getRequestOptions(url) {
        const requestOptions = {};
        const proxy = url.startsWith('https://') ? (process.env.npm_config_https_proxy || process.env.HTTPS_PROXY) :
            (process.env.npm_config_proxy || process.env.npm_config_http_proxy || process.env.HTTP_PROXY);
        if (proxy) {
            const proxyUrl = new URL(proxy);
            const noProxy = (process.env.npm_config_no_proxy || process.env.NO_PROXY || '').split(',');
            if (noProxy.find(exc => proxyUrl.hostname.endsWith(exc)) !== undefined) {
                console.info('Using http(s) proxy server: ' + proxy);
                const tunnelOptions = {
                    proxy: {
                        host: proxyUrl.hostname,
                        port: proxyUrl.port
                    }
                };
                if (proxyUrl.username && proxyUrl.password) {
                    tunnelOptions.proxy.proxyAuth = `${proxyUrl.username}:${proxyUrl.password}`;
                }

                const agent = {};
                if (url.startsWith('https://')) {
                    if (proxy.startsWith('https://')) {
                        agent.https = tunnel.httpsOverHttps(tunnelOptions);
                    } else {
                        agent.https = tunnel.httpsOverHttp(tunnelOptions);
                    }
                } else if (proxy.startsWith('https://')) {
                    agent.http = tunnel.httpOverHttps(tunnelOptions);
                } else {
                    agent.http = tunnel.httpOverHttp(tunnelOptions);
                }

                requestOptions.agent = agent;
            }
        }

        return requestOptions;
    }
};
