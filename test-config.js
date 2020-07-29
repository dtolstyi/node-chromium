'use strict';

import test from 'ava';

const config = require('./config');

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
    // Ensure a consistent, known environment reset for each test
    config._setEnv({});

    t.pass();
});

test.serial('Can "unmock" the environment', t => {
    config._setEnv(null);
    process.env.FOO_BAR = 'THE_REAL_FOOBAR';
    t.is(process.env.FOO_BAR, config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar returns string always', t => {
    config._setEnv({});
    t.is('', config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar basic test', t => {
    config._setEnv({
        FOO_BAR: 'foobar'
    });
    t.is('foobar', config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar looks for npm_config version', t => {
    config._setEnv({
        npm_config_foo_bar: 'barfoo'
    });
    t.is('barfoo', config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar prefers npm_config version', t => {
    config._setEnv({
        FOO_BAR: 'foobar',
        npm_config_foo_bar: 'barfoo'
    });
    t.is('barfoo', config.getEnvVar('FOO_BAR'), 'npm_config_ variant should trump raw env var');
});
