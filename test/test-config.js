'use strict';

const test = require('ava');

const testUtils = require('./_utils');
const config = require('../config');

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
    testUtils.clearEnvVar('FOO_BAR');
    t.pass();
});

test.serial('getEnvVar returns string always', t => {
    t.is('', config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar basic test', t => {
    const expected = Date.now().toString();
    process.env.FOO_BAR = expected;
    t.is(expected, config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar looks for npm_config version', t => {
    const expected = Date.now().toString();
    process.env.npm_config_foo_bar = expected;
    t.is(expected, config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar prefers npm_config version', t => {
    const expected = Date.now().toString();
    process.env.FOO_BAR = 'foobar';
    process.env.npm_config_foo_bar = expected;
    t.is(expected, config.getEnvVar('FOO_BAR'), 'npm_config_ variant should trump raw env var');
});
