/**
 * @file Unit test for prompt.js
 */

const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const prompt = require('../prompt');
const log = require('../lib/log');
const cst = require('../constants');
const db = require('../lib/db-commons');


const sandbox = sinon.sandbox.create();

describe('prompt', function () {
    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    describe('loadConfigurationFile', function () {
        let fseMock;
        let logMock;

        beforeEach(function () {
            fseMock = sandbox.mock(fse);
            logMock = sandbox.mock(log);
        });

        it('informs when there is no configuration file and resolves a default object', function () {
            logMock.expects('info').once().withArgs(cst.messages.noConfig);
            fseMock.expects('pathExists').once().resolves(false);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, { mode: cst.modes.manual });
            });
        });

        it('informs it is loading the configuration file and return validated configuration object', function () {
            const validConfiguration = {
                dbms: 'mysql',
                host: '192.168.32.2',
                port: '3306',
                user: 'root',
                password: 'verystrongpassword'
            };
            // cast number as validation framework would do.
            const validatedConfiguration = Object.assign({ mode: cst.modes.manual }, validConfiguration, { port: 3306 });

            fseMock.expects('pathExists').once().resolves(true);
            fseMock.expects('readJson').once().resolves(validConfiguration);

            logMock.expects('info').once().withArgs(cst.messages.loadingConfig);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, validatedConfiguration);
            });
        });
    });

    describe('askCredentials', function () {
        let stub;

        beforeEach(function () {
            stub = sandbox.stub(inquirer, 'prompt').resolves({});
        });

        it('asks all items if provided configuration is empty', function () {
            return prompt.askCredentials({}).then(() => {
                assert.deepStrictEqual(stub.getCall(0).args[0], [
                    prompt.inquiries.dbms,
                    prompt.inquiries.host,
                    prompt.inquiries.port,
                    prompt.inquiries.user,
                    prompt.inquiries.password,
                    prompt.inquiries.schema
                ]);
            });
        });

        it('doesn\'t ask items provided by the configuration', function () {
            const partialConfiguration = { dbms: 'mysql', host: '192.168.32.2', password: 'nope' };

            return prompt.askCredentials(partialConfiguration).then(() => {
                const args = stub.getCall(0).args[0];
                // filter args to only keep unexpected enquiries, which answers are already provided by configuration
                const wronglyInquired = args.filter(inquiry => Object.keys(partialConfiguration).includes(inquiry.name));
                assert.deepStrictEqual(wronglyInquired, []);
            });
        });

        it('deduces default port from configured dbms', function () {
            const configurationWithDbms = { dbms: db.dbmsList.mysql.name };

            return prompt.askCredentials(configurationWithDbms).then(() => {
                const inquiries = stub.getCall(0).args[0];
                const portInquiry = inquiries.find(inquiry => inquiry.name === 'port');
                assert.strictEqual(portInquiry.default, prompt.inquiries.port.default(configurationWithDbms));
            });
        });
    });

    describe('selectEntities', function () {
        let promptStub;

        beforeEach(function () {
            promptStub = sandbox.stub(inquirer, 'prompt');
        });

        it('forms the enquiry according to the data it receives', function () {
            const dummyTable = { tables: 'table' };
            const dummyTwoTypeJunction = { twoType: 'twoType' };
            const dummyJhipster = { jhi: 'jhi' };
            const dummyLiquibase = { liqui: 'liqui' };

            const dummySession = {
                results: {
                    tables: [dummyTable],
                    manyToManyTablesOnly: [dummyTwoTypeJunction],
                    jhipster: [dummyJhipster],
                    liquibase: [dummyLiquibase],
                }
            };

            const dummySeparatorTable = { tables: 'separator-tables' };
            const dummySeparatorTwoTypeJunction = { twoType: 'separator-twoType' };
            const dummySeparatorJhipster = { jhi: 'separator-jhi' };
            const dummySeparatorLiquibase = { liqui: 'separator-liqui' };

            const dummyChoices = [
                dummySeparatorTable,
                { value: dummyTable, name: null, checked: true },
                dummySeparatorTwoTypeJunction,
                { value: dummyTwoTypeJunction, name: null, checked: false },
                dummySeparatorJhipster,
                { value: dummyJhipster, name: null, checked: false },
                dummySeparatorLiquibase,
                { value: dummyLiquibase, name: null, checked: false }
            ];

            const dummyEnquiry = Object.assign({}, prompt.inquiries.entities, { choices: dummyChoices });

            const separatorStub = sandbox.stub(inquirer, 'Separator');
            separatorStub.withArgs(cst.headers.tables).returns(dummySeparatorTable);
            separatorStub.withArgs(cst.headers.manyToManyTablesOnly).returns(dummySeparatorTwoTypeJunction);
            separatorStub.withArgs(cst.headers.jhipster).returns(dummySeparatorJhipster);
            separatorStub.withArgs(cst.headers.liquibase).returns(dummySeparatorLiquibase);

            promptStub.resolves();

            return prompt.selectEntities(dummySession).then(() => {
                assert.deepStrictEqual(promptStub.firstCall.args[0], dummyEnquiry);
            });
        });

        it('merges answers from inquirer and received input', function () {
            const dummyInput = {
                results: {
                    tables: ['tables'],
                    manyToManyTablesOnly: ['manyToManyTablesOnly'],
                    jhipster: ['jhipster'],
                    liquibase: ['liquibase']
                }
            };
            const dummyAnswer = { answer: 'answer' };

            promptStub.resolves(dummyAnswer);

            return prompt.selectEntities(dummyInput).then((result) => {
                assert.deepStrictEqual(result, Object.assign({}, dummyInput, dummyAnswer));
            });
        });
    });

    describe('selectColumns', function () {
        let promptStub = null;

        beforeEach(function () {
            promptStub = sandbox.stub(inquirer, 'prompt');
        });

        it('forms the enquiry according to the data it received');
    });
});
