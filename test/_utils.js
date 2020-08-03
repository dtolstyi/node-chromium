/*
* Test utils
*/
const platform = process.platform;
const arch = process.arch;

/**
 * Sets an environment variable and the corresponding npm_config variant.
 *
 * @param {string} name The UPPER_CASE name of the environment variable.
 * @param {string} value The value to set - if falsy will be deleted.
 */
function setEnvVar(name, value) {
    const npmName = `npm_config_${name.toLowerCase()}`;
    process.env[name] = value;
    process.env[npmName] = value;
}

/**
 * Clear an environment variable and the corresponding npm_config variant.
 *
 * @param {string} name The UPPER_CASE name of the environment variable.
 */
function clearEnvVar(name) {
    const npmName = `npm_config_${name.toLowerCase()}`;
    delete process.env[name];
    delete process.env[npmName];
}

/**
 * Mocks out the platform value on the global process object.
 * @param {string} newPlatformValue The mock platform.
 */
function mockPlatform(newPlatformValue) {
    Object.defineProperty(process, 'platform', {
        value: newPlatformValue
    });
}

/**
 * Mocks out the arch value on the global process object.
 * @param {string} newArchValue The mock architecture.
 */
function mockArch(newArchValue) {
    Object.defineProperty(process, 'arch', {
        value: newArchValue
    });
}

/**
 * Resets all mocked properties.
 */
function clearMocks() {
    mockPlatform(platform);
    mockArch(arch);
}

module.exports = {
    mockPlatform,
    mockArch,
    clearMocks,
    setEnvVar,
    clearEnvVar
};
