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

    describe('removeColumns', function () {
        const beforeEntities = {
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

        // this array + the dummy entities produces the expected entities
        const dummySelectedColumns = [
            'authors.name',
            'authors.birth_date',
            'books.title',
            'books.price',
            'books.author'
        ];

        // expected entities after removal
        // 'id' columns aren't selected
        const afterEntities = {
            authors: {
                name: { ordinalPosition: 2, columnType: 'varchar(255)' },
                birth_date: { ordinalPosition: 3, columnType: 'date' } },
            books: {
                title: { ordinalPosition: 2, columnType: 'varchar(255)' },
                price: { ordinalPosition: 3, columnType: 'bigint(20)' },
                author: { ordinalPosition: 4, columnType: 'int(11)' }
            }
        };

        it('keeps the initial entities unchanged', function () {
            // check that after using this function, the removed properties are still in the initial entities
            prompt.removeColumns(beforeEntities, dummySelectedColumns);
            assert(beforeEntities.authors.id !== undefined);
            assert(beforeEntities.books.id !== undefined);
        });

        it('removes the columns that are not part of the source entities', function () {
            const actualEntities = prompt.removeColumns(beforeEntities, dummySelectedColumns);

            // check that both entities object (before & after removal) have the exact same number of tables
            const beforeTables = Object.keys(beforeEntities);
            const afterTables = Object.keys(afterEntities);
            const actualTables = Object.keys(actualEntities);

            assert((beforeTables.length === afterTables.length) && (beforeTables.length === actualTables.length));

            beforeTables.forEach((beforeTable, index) => {
                assert.strictEqual(beforeTables[index], afterTables[index]);
                assert.strictEqual(beforeTables[index], actualTables[index]);
            });

            // check that the expected and actual entities with removed columns are identical
            // and that the columns not selected are part of the dummy unselected columns
            // and that the selected columns are part of the dummy selected columns
            beforeTables.forEach((table) => {
                const beforeColumns = Object.keys(beforeEntities[table]);
                beforeColumns.forEach((column) => {
                    // check a removed column is also removed from the actual entities & still exists in the initial object
                    if (afterEntities[table][column] === undefined) {
                        assert.strictEqual(actualEntities[table][column], undefined);
                        assert(typeof beforeEntities[table][column] === 'object');
                        // assert the removed column isn't part of the selected columns
                        assert(!dummySelectedColumns.includes(`${table}.${column}`));
                    } else {
                        const afterProperties = Object.keys(afterEntities[table][column]);
                        afterProperties.forEach((prop) => {
                            assert.strictEqual(afterEntities[table][column][prop], actualEntities[table][column][prop]);
                        });
                    }
                });
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
            logMock.expects('info').once().withArgs(cst.messages.noConfig);
            fseMock.expects('pathExists').once().resolves(false);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, {});
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
            const validatedConfiguration = Object.assign({}, validConfiguration, { port: 3306 });

            fseMock.expects('pathExists').once().resolves(true);
            fseMock.expects('readJson').once().resolves(validConfiguration);

            logMock.expects('info').once().withArgs(cst.messages.loadingConfig);

            return prompt.loadConfigurationFile().then((config) => {
                assert.deepStrictEqual(config, validatedConfiguration);
            });
        });

        it('throws validationError on invalid configuration', function () {
            const invalidConfiguration = {
                dbms: ''
            };

            fseMock.expects('pathExists').once().resolves(true);
            fseMock.expects('readJson').once().resolves(invalidConfiguration);

            logMock.expects('info').once().withArgs(cst.messages.loadingConfig);

            return prompt.loadConfigurationFile().then((config) => {
                assert.fail(config, undefined, 'Promise should have rejected with a ValidationError', '!==');
            }, (error) => {
                assert.ok(error, 'fails as expected');
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

            const dummyEnquiry = Object.assign({}, prompt.inquiries.entities, { choices: dummyChoices });

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
                assert.deepStrictEqual(result, Object.assign({}, dummyInput, dummyAnswer));
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
    });

    describe('selectColumns', function () {
        const expectedEntities = dummyEntities;

        const dummySession = {
            entities: dummyEntities
        };

        // user selects all questions
        const expectedAnswer = { selectedColumns: [
            'authors.id',
            'authors.name',
            'authors.birth_date',
            'books.id',
            'books.title',
            'books.price',
            'books.author'
        ] };

        let promptStub = null;

        beforeEach(function () {
            promptStub = sandbox.stub(inquirer, 'prompt');
        });

        it('returns the expected columns when user select all of them', function () {
            promptStub.resolves(expectedAnswer);

            return prompt.selectColumns(dummySession)
                .then((answer) => {
                    // the answer holds only entities
                    const tables = Object.keys(answer.entities);
                    tables.forEach((table) => {
                        const columns = Object.keys(answer.entities[table]);
                        columns.forEach((column) => {
                            const properties = Object.keys(answer.entities[table][column]);
                            properties.forEach((prop) => {
                                assert.strictEqual(expectedEntities[table][column][prop], answer.entities[table][column][prop]);
                            });
                        });
                    });
                });
        });
    });
});
