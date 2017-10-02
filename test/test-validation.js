/**
 * @file Unit test for lib/validation.js
 */

const assert = require('assert');
const sinon = require('sinon');
const joi = require('joi');

const validation = require('../lib/validation');


const sandbox = sinon.sandbox.create();

describe('lib/validation', function () {
    afterEach(function () {
        // I restore original functions after each test
        // I must do so mocks from previous tests don't interfere with following tests
        sandbox.verifyAndRestore();
    });

    describe('validationFromJoi', function () {
        const rule = joi
            .string()
            .allow('localhost')
            .ip({
                version: ['ipv4', 'ipv6'],
                cidr: 'forbidden'
            });
        const validationMethod = validation.validationFromJoi(rule);

        it('returns true when joi would return a null error', function () {
            const validInput = 'localhost';

            assert(validationMethod(validInput));
        });

        it('returns the error joi would put in his return object', function () {
            const emptyInput = '';
            const invalidInput = '256.0.0.1';

            assert.deepStrictEqual(validationMethod(emptyInput), joi.validate(emptyInput, rule).error);
            assert.deepStrictEqual(validationMethod(invalidInput), joi.validate(invalidInput, rule).error);
        });

        it('calls joi.validate with the provided joi schema and input', function () {
            const validateSpy = sandbox.spy(joi, 'validate');

            const anyInput = {};

            validationMethod(anyInput);

            assert.strictEqual(validateSpy.getCall(0).args[0], anyInput);
            assert.strictEqual(validateSpy.getCall(0).args[1], rule);
        });
    });

    describe('validateConfiguration', function () {
        it('throws validationError on invalid configuration', function () {
            const invalidConfiguration = {
                dbms: ''
            };

            assert.throws(() => validation.validateConfiguration(invalidConfiguration), /ValidationError/, 'error thrown');
        });

        it('throws on incomplete configuration with automatic mode', function () {
            const incompleteConfiguration = {
                mode: 'automatic'
            };

            assert.throws(() => validation.validateConfiguration(incompleteConfiguration), /ValidationError/, 'error thrown');
        });

        it('accepts full configuration with automatic mode', function () {
            const completeConfiguration = {
                mode: 'automatic',
                dbms: 'mysql',
                host: '192.168.32.2',
                port: '3306',
                user: 'root',
                password: 'password',
                schema: 'elearning',
            };

            assert.doesNotThrow(() => validation.validateConfiguration(completeConfiguration));
        });
    });
});
