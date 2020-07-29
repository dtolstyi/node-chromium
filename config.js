'use strict';

const path = require('path');

let environment = process.env;

module.exports = {
    /**
     * Set an alternative "env" object. If not set will use process.env.
     * This is intended for mocking out the env in unit tests.
     * @param env Object exposing key/value pairs of environment variables. Pass a falsey value to unset.
     */
    _setEnv: env => {
        environment = env || process.env;
    },
    BIN_OUT_PATH: path.join(__dirname, 'lib', 'chromium'),
    /**
     * Gets a configuration parameter from the environment.
     * Will first check for a lowercase variant set via npm config in the format: `npm_config_${name.toLowerCase()}`.
     * If not set then will check the environment for the variable, as provided.
     * @param {string} name The name of the environment variable, case sensitive, conventionally uppercase.
     * @returns {string} The value of the environment variable.
     */
    getEnvVar: name => {
        if (!name) {
            return '';
        }
        const npmConfigKey = `npm_config_${name.toLowerCase()}`;
        let result = environment[npmConfigKey];
        if (result) {
            return result;
        }
        result = environment[name] || '';
        return result;
    }
};
