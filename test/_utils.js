/*
* Test utils
*/

const platform = process.platform;
const arch = process.arch;

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
    clearMocks
};
