/**
 * @file Unit test for lib/validation.js
 */

const assert = require('assert');
const sinon = require('sinon');
const joi = require('joi');

const validation = require('../lib/validation');
const db = require('../lib/db-commons');


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

    describe('validateDbms', function () {
        // iterate over each key of dbmsList as it is by definition the dbms name
        Object.keys(db.dbmsList).forEach(function (dbms) {
            it(`returns true if input is ${dbms}`, function () {
                assert(validation.validateDbms(dbms));
            });
        });

        it('returns an error if input isn\'t a dbms from the list', function () {
            assert.strictEqual(validation.validateDbms('mysl').constructor.name, 'Error');
        });
    });
});
