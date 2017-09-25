/**
 * @file Unit test for prompt.js
 */

const assert = require('assert');
const sinon = require('sinon');
const inquirer = require('inquirer');
const lodash = require('lodash');
const fse = require('fs-extra');

const prompt = require('../prompt');
const log = require('../lib/log');
const cst = require('../constants');
const db = require('../lib/db-commons');

const sandbox = sinon.sandbox.create();
const inquiries = cst.inquiries;

// for testing selectColumns and selectColumnsQuestionChoices
// generated with dbi_book_author
const dummyEntities = {
    authors: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        name: { ordinalPosition: 2, columnType: 'varchar(255)' },
        birth_date: { ordinalPosition: 3, columnType: 'date' } },
    books: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        title: { ordinalPosition: 2, columnType: 'varchar(255)' },
        price: { ordinalPosition: 3, columnType: 'bigint(20)' },
        author: { ordinalPosition: 4, columnType: 'int(11)' }
    }
};

describe('prompt', function () {
    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    describe('askCredentials', function () {
        let stub;

        beforeEach(function () {
            stub = sandbox.stub(inquirer, 'prompt').resolves({});
        });

        it('asks all items if provided configuration is empty', function () {
            return prompt.askCredentials({}).then(() => {
                assert.deepStrictEqual(stub.getCall(0).args[0], [
                    inquiries.dbms,
                    inquiries.host,
                    inquiries.port,
                    inquiries.user,
                    inquiries.password,
                    inquiries.schema
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
                assert.strictEqual(portInquiry.default, cst.inquiries.port.default(configurationWithDbms));
            });
        });
    });

    describe('loadConfigurationFile', function () {
        let fseMock;
        let logMock;

        beforeEach(function () {
            fseMock = sandbox.mock(fse);
            logMock = sandbox.mock(log);
        });

        it('informs when there is no configuration file and resolves an empty object', function () {
            fseMock.expects('readJson').rejects({ errno: -2 });

            logMock.expects('info').once().withArgs(cst.messages.noConfig);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, {});
            });
        });

        it('logs file reading errors and resolves empty object (except for file absence)', function () {
            const dummyError = new Error('dummy fse.readJson error');
            fseMock.expects('readJson').rejects(dummyError);

            logMock.expects('failure').once().withArgs(dummyError);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, {});
            });
        });

        it('warns user about invalid configuration properties and deletes them', function () {
            const dummyConfig = {
                dbm: 'mysql',
                dbms: 'mysql',
                hast: '192.65.32.65',
                port: 3306,
            };
            fseMock.expects('readJson').resolves(dummyConfig);
            logMock.expects('info').once(); // suppressing unwanted output
            const dbmIsInvalid = `dbm is defined in ${cst.configFile} but is not a valid configuration property`;
            const hastIsInvalid = `hast is defined in ${cst.configFile} but is not a valid configuration property`;

            logMock.expects('warning').once().withArgs(dbmIsInvalid);
            logMock.expects('warning').once().withArgs(hastIsInvalid);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, { dbms: 'mysql', port: 3306 });
            });
        });

        it('warns user about invalid configuration item and deletes them', function () {
            const dummyConfig = {
                host: '19.168.32.',
                port: '-',
                user: 'root',
                password: 'very-good'
            };
            fseMock.expects('readJson').resolves(dummyConfig);
            logMock.expects('info').once(); // suppressing unwanted output
            const invalidHost = `${cst.configFile} "host": "19.168.32." ${inquiries.host.validate(dummyConfig.host)}`;
            const invalidPort = `${cst.configFile} "port": "-" ${inquiries.port.validate(dummyConfig.port)}`;

            logMock.expects('warning').once().withArgs(invalidHost);
            logMock.expects('warning').once().withArgs(invalidPort);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, { user: 'root', password: 'very-good' });
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
                    twoTypeJunction: [dummyTwoTypeJunction],
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
                { value: dummyTable, checked: true },
                dummySeparatorTwoTypeJunction,
                { value: dummyTwoTypeJunction, checked: false },
                dummySeparatorJhipster,
                { value: dummyJhipster, checked: false },
                dummySeparatorLiquibase,
                { value: dummyLiquibase, checked: false }
            ];

            const dummyEnquiry = lodash.clone(cst.inquiries.entities);
            dummyEnquiry.choices = dummyChoices;

            const separatorStub = sandbox.stub(inquirer, 'Separator');
            separatorStub.withArgs(cst.headers.tables).returns(dummySeparatorTable);
            separatorStub.withArgs(cst.headers.twoTypeJunction).returns(dummySeparatorTwoTypeJunction);
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
                    twoTypeJunction: ['twoTypeJunction'],
                    jhipster: ['jhipster'],
                    liquibase: ['liquibase']
                }
            };
            const dummyAnswer = { answer: 'answer' };

            promptStub.resolves(dummyAnswer);

            return prompt.selectEntities(dummyInput).then((result) => {
                assert.deepStrictEqual(result, Object.assign(dummyInput, dummyAnswer));
            });
        });
    });

    describe('selectColumnsQuestionChoices', function () {
        // template choices, generated with dbi_book_author
        const expectedChoices = [
            { type: 'separator', line: '\u001b[2mauthors\u001b[22m' },
            { name: 'id (int(11))', value: 'authors.id', checked: true },
            { name: 'name (varchar(255))', value: 'authors.name', checked: true },
            { name: 'birth_date (date)', value: 'authors.birth_date', checked: true },
            { type: 'separator', line: '\u001b[2mbooks\u001b[22m' },
            { name: 'id (int(11))', value: 'books.id', checked: true },
            { name: 'title (varchar(255))', value: 'books.title', checked: true },
            { name: 'price (bigint(20))', value: 'books.price', checked: true },
            { name: 'author (int(11))', value: 'books.author', checked: true }
        ];

        // template question for selectColumns' and related functions' unit tests
        const expectedQuestion = {
            type: 'checkbox',
            name: 'columns',
            message: 'Select the columns you want to import:',
            pageSize: 25,
            choices: expectedChoices,
        };

        it('returns the expected choices', function () {
            const actualChoices = prompt.selectColumnsQuestionChoices(dummyEntities);

            let keys = null;

            actualChoices.forEach((actualChoice, index) => {
                keys = Object.keys(actualChoice);

                // assert that each property value in the returned choices are correct
                keys.forEach((key) => {
                    assert.strictEqual(actualChoice[key], expectedChoices[index][key]);
                });
            });
        });

        it('throws an error with an empty parameter', function () {
            assert.throws(() => (prompt.selectColumnsQuestionChoices({})), Error);
        });
    });
});
