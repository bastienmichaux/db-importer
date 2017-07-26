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
});
