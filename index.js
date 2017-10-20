'use strict';

const config = require('./config');
const utils = require('./utils');

const fs = require('fs');

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
