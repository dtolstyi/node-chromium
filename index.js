'use strict';

const fs = require('fs');

const utils = require('./utils');

function getBinaryPath() {
    const path = utils.getOsChromiumBinPath();

    console.log('Chromiu: ', path);

    if (fs.existsSync(path)) {
        return path;
    }

    return undefined;
}

module.exports = {
    path: getBinaryPath()
};
