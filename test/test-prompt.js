const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');
const joi = require('joi');
const lodash = require('lodash');
const fse = require('fs-extra');

const prompt = require('../prompt');
const cst = require('../constants');

const sandbox = sinon.sandbox.create();
const inquiries = cst.inquiries;

describe('prompt', function () {
    afterEach(function () {
        sandbox.restore();
    });

    describe('askCredentials', function () {
        it('is called with expected arguments', function () {
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

    describe('init', function () {
        let fseMock;

        beforeEach(function () {
            fseMock = sandbox.mock(fse);
        });

        it('informs when there is no configuration file and resolves an empty object', function () {
            fseMock.expects('readJson').rejects({ errno: -2 });

            // todo check calls to log

            return prompt.init().then((config) => {
                assert.deepEqual(config, {});
            });
        });

        it('prints the error message when there is one and resolves an empty object', function () {
            const dummyError = {};
            fseMock.expects('readJson').rejects(dummyError);

            // todo check calls to log

            return prompt.init().then((config) => {
                assert.deepEqual(config, {});
            });
        });

        it('disables prompts for specified items and resolves found configuration object', function () {
            const dummyConfig = {
                dbms: 'mysql',
                host: '127.0.0.1',
                port: '3306',
                user: 'dev',
                password: 'password',
                schema: 'schema'
            };
            fseMock.expects('readJson').resolves(dummyConfig);

            return prompt.init().then((config) => {
                assert.equal(config, dummyConfig);
            });
        });

        it('warns user if provided item isn\'t valid', function () {
            const dummyConfig = {
                dbm: 'mysql'
            };
            fseMock.expects('readJson').resolves(dummyConfig);

            return prompt.init().then(() => {
                assert.fail('must check if warning occurs');
            });
        });

        it('warns user if provided item value doesn\'t pass validation', function () {
            const dummyConfig = {
                port: '-'
            };
            fseMock.expects('readJson').resolves(dummyConfig);

            return prompt.init().then(() => {
                assert.fail('must check if warning occurs');
            });
        });

        it('lets current default if it cannot deduce one from configuration', function () {
            const dummyConfig = {};
            fseMock.expects('readJson').resolves(dummyConfig);

            // we force one enquiry to be una
            const backupDefault = cst.inquiries.port.default;
            cst.inquiries.port.default = () => null;

            return prompt.init().then(() => {
                cst.inquiries.port.default = backupDefault;

                assert.fail('must check if warning occurs');
            });
        });
    });
});
