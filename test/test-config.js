'use strict';

const test = require('ava');

const config = require('../config');

/* eslint camelcase: ["error", {properties: "never"}] */

test.serial('getEnvVar returns string always', t => {
    delete process.env.FOO_BAR; // Make sure this doesn't exist
    t.is('', config.getEnvVar('FOO_BAR'));
});

test.serial('getEnvVar basic test', t => {
    const expected = Date.now().toString();
    try {
        process.env.FOO_BAR = expected;
        t.is(expected, config.getEnvVar('FOO_BAR'));
    } finally {
        delete process.env.FOO_BAR;
    }
});

test.serial('getEnvVar looks for npm_config version', t => {
    const expected = Date.now().toString();
    try {
        process.env.npm_config_foo_bar = expected;
        t.is(expected, config.getEnvVar('FOO_BAR'));
    } finally {
        delete process.env.npm_config_foo_bar;
    }
});

test.serial('getEnvVar prefers npm_config version', t => {
    const expected = Date.now().toString();
    try {
        process.env.FOO_BAR = 'foobar';
        process.env.npm_config_foo_bar = expected;
        t.is(expected, config.getEnvVar('FOO_BAR'), 'npm_config_ variant should trump raw env var');
    } finally {
        delete process.env.FOO_BAR;
        delete process.env.npm_config_foo_bar;
    }
});
