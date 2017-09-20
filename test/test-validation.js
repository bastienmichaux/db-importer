/**
 * @file Unit test for lib/validation.js
 */

const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');
const joi = require('joi');

const valid = require('../lib/validation');


const sandbox = sinon.sandbox.create();

describe('validation', function () {
    afterEach(function () {
        // I restore original functions after each test
        // I must do so mocks from previous tests don't interfere with following tests
        sandbox.verifyAndRestore();
    });

    const rule = joi
        .string()
        .allow('localhost')
        .ip({
            version: ['ipv4', 'ipv6'],
            cidr: 'forbidden'
        });
    const validationMethod = valid.validation(rule);

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
