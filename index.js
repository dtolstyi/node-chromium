'use strict';

const fs = require('fs');

const utils = require('./utils');

function getBinaryPath() {
    const path = utils.getOsChromiumBinPath();

    if (fs.existsSync(path)) {
        return path;
    }

    return undefined;
}

module.exports = {
    /*
     * The path property needs to use a getter because the binaries may not be present for any number of reasons.
     * Using a getter allows this property to update itself as needed and reflect the current state of the filesystem.
     */
    get path() {
        return getBinaryPath();
    },
    install: require('./install')
};
