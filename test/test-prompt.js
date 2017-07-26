const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');
const joi = require('joi');

const prompt = require('../prompt');
const cst = require('../constants');

const sandbox = sinon.sandbox.create();
const inquiries = cst.inquiries;

describe('prompt', function () {
    afterEach(function () {
        // I restore original functions after each test
        // I must do so mocks from previous tests don't interfere with following tests
        sandbox.restore();
    });

    describe('askCredentials', function () {
        it('was called with expected arguments', function () {
            // This replaces the function inquirer.prompt with a stub.
            const stub = sandbox.stub(inquirer, 'prompt');

            prompt.askCredentials();

            assert.deepEqual(stub.getCall(0).args[0], [
                inquiries.dbms,
                inquiries.host,
                inquiries.port,
                inquiries.user,
                inquiries.password,
                inquiries.schema
            ]);
        });
    });

    describe('validation', function () {
        const rule = joi
            .string()
            .allow('localhost')
            .ip({
                version: ['ipv4', 'ipv6'],
                cidr: 'forbidden'
            });
        const validationMethod = prompt.validation(rule);

        it('returns true when joi would return a null error', function () {
            const validInput = 'localhost';

            assert(validationMethod(validInput));
        });

        it('returns the error joi would put in his return object', function () {
            const emptyInput = '';
            const invalidInput = '256.0.0.1';

            assert.deepEqual(validationMethod(emptyInput), joi.validate(emptyInput, rule).error);
            assert.deepEqual(validationMethod(invalidInput), joi.validate(invalidInput, rule).error);
        });

        it('calls joi.validate with the provided joi schema and input', function () {
            const validateSpy = sandbox.spy(joi, 'validate');

            const anyInput = {};

            validationMethod(anyInput);

            assert.equal(validateSpy.getCall(0).args[0], anyInput);
            assert.equal(validateSpy.getCall(0).args[1], rule);
        });
    });
});
