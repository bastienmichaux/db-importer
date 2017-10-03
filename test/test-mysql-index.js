/**
 * @file Unit test for lib/mysql/index.js
 */

const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const cst = require('../lib/mysql/constants');
const index = require('../lib/mysql/index');

const sandbox = sinon.sandbox.create();

const dummyQueryResults = [
    {
        table_name: 'authors',
        column_name: 'id',
        ordinal_position: 1,
        column_type: 'int(11)'
    }, {
        table_name: 'authors',
        column_name: 'name',
        ordinal_position: 2,
        column_type: 'varchar(255)'
    }, {
        table_name: 'authors',
        column_name: 'birth_date',
        ordinal_position: 3,
        column_type: 'date'
    }, {
        table_name: 'books',
        column_name: 'id',
        ordinal_position: 1,
        column_type: 'int(11)'
    }, {
        table_name: 'books',
        column_name: 'title',
        ordinal_position: 2,
        column_type: 'varchar(255)'
    }, {
        table_name: 'books',
        column_name: 'price',
        ordinal_position: 3,
        column_type: 'bigint(20)'
    }, {
        table_name: 'books',
        column_name: 'author',
        ordinal_position: 4,
        column_type: 'int(11)'
    }
];

const dummyTables = ['authors', 'books'];

const dummyEntities = {
    authors: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        name: { ordinalPosition: 2, columnType: 'varchar(255)' },
        birth_date: { ordinalPosition: 3, columnType: 'date' }
    },
    books: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        title: { ordinalPosition: 2, columnType: 'varchar(255)' },
        price: { ordinalPosition: 3, columnType: 'bigint(20)' },
        author: { ordinalPosition: 4, columnType: 'int(11)' }
    }
};

describe('lib/mysql/index', function () {
    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    describe('connect', function () {
        let createConnectionStub;
        let connectStub;

        afterEach(function () {
            sinon.assert.calledOnce(createConnectionStub);
            sinon.assert.calledOnce(connectStub);
        });

        it('uses provided parameters to create connection', function () {
            connectStub = sandbox.stub().callsArgWith(0, null);
            createConnectionStub = sandbox.stub(mysql, 'createConnection').returns({
                connect: connectStub,
            });

            const dummyCredentials = {
                host: {},
                port: {},
                user: {},
                password: {}
            };

            return index.connect(dummyCredentials).then(() => {
                assert.strictEqual(createConnectionStub.firstCall.args[0].host, dummyCredentials.host);
                assert.strictEqual(createConnectionStub.firstCall.args[0].port, dummyCredentials.port);
                assert.strictEqual(createConnectionStub.firstCall.args[0].user, dummyCredentials.user);
                assert.strictEqual(createConnectionStub.firstCall.args[0].password, dummyCredentials.password);
            });
        });

        it('rejects the error it receives from session.connection.connect', function () {
            const dummyError = {};
            connectStub = sandbox.stub().callsArgWith(0, dummyError);
            createConnectionStub = sandbox.stub(mysql, 'createConnection').returns({
                connect: connectStub,
            });

            return index.connect({}).then((session) => {
                assert.fail(session, null, 'This promise should have been rejected !');
            }, (error) => {
                assert.strictEqual(error, dummyError);
            });
        });
    });

    describe('close', function () {
        let endStub;

        afterEach(function () {
            sinon.assert.calledOnce(endStub);
        });

        it('resolves when session.connection.end returns an error of values null', function () {
            endStub = sandbox.stub().callsArgWith(0, null);
            const dummySession = {
                end: endStub
            };

            return index.close(dummySession).then(() => {
                assert.ok(true);
            });
        });

        it('rejects the error it receives from session.connection.end', function () {
            const dummyError = {};
            endStub = sandbox.stub().callsArgWith(0, dummyError);
            const dummySession = {
                end: endStub
            };

            return index.close(dummySession).then((session) => {
                assert.fail(session, null, 'This promise should have been rejected !');
            }, (error) => {
                assert.strictEqual(error, dummyError);
            });
        });
    });

    describe('entityCandidates', function () {
        let dummySession;
        let queryStub;

        beforeEach(function () {
            queryStub = sandbox.stub();
            dummySession = {
                connection: {
                    query: queryStub.resolves()
                },
                results: {},
                schema: 'dummySchema'
            };
        });

        it('rejects with connection.query error', function () {
            const dummyError = {};
            queryStub.callsArgWith(1, dummyError);

            return index.entityCandidates(dummySession).then(() => {
                assert.fail('promise should be rejected');
            }, (error) => {
                assert.strictEqual(error, dummyError);
            });
        });

        it('stores connection.query in session.results', function () {
            // we want something like [ RawDataPacket{ TABLE_NAME: 'value' }]
            const dummyJhipster = [{ [cst.fields.tableName]: {} }];
            const dummyLiquibase = [{ [cst.fields.tableName]: {} }];
            const dummyTwoTypeJunction = [{ [cst.fields.tableName]: {} }];
            const dummyTables = [{ [cst.fields.tableName]: {} }];

            /**
             * we want something like :
             * {
             *     jhipster: [ 'value' ],
             *     liquibase: [ 'value' ],
             *     twoTypeJunction: [ 'value' ],
             *     tables: [ 'value' ]
             * }
             */
            const dummyResults = {
                jhipster: [dummyJhipster[0][cst.fields.tableName]],
                liquibase: [dummyLiquibase[0][cst.fields.tableName]],
                twoTypeJunction: [dummyLiquibase[0][cst.fields.tableName]],
                tables: [dummyLiquibase[0][cst.fields.tableName]]
            };

            queryStub.onCall(0).callsArgWith(1, null, dummyJhipster);
            queryStub.onCall(1).callsArgWith(1, null, dummyLiquibase);
            queryStub.onCall(2).callsArgWith(1, null, dummyTwoTypeJunction);
            queryStub.onCall(3).callsArgWith(1, null, dummyTables);

            return index.entityCandidates(dummySession).then(() => {
                // checking the value
                assert.deepStrictEqual(dummySession.results, dummyResults);

                // checking each reference, that is, it uses the exact 'value' it received
                assert.strictEqual(dummySession.results.jhipster[0], dummyJhipster[0][cst.fields.tableName]);
                assert.strictEqual(dummySession.results.liquibase[0], dummyLiquibase[0][cst.fields.tableName]);
                assert.strictEqual(dummySession.results.twoTypeJunction[0], dummyTwoTypeJunction[0][cst.fields.tableName]);
                assert.strictEqual(dummySession.results.tables[0], dummyTables[0][cst.fields.tableName]);
            });
        });
    });

    describe('organizeColumns', function () {
        it('returns an organized object representing the database structure', function () {
            const actualResult = index.organizeColumns(dummyQueryResults, dummyTables);
            const expectedResult = dummyEntities;

            // first check we have the exact same number of tables, and the tables have the same name
            const actualResultTables = Object.keys(actualResult);
            const expectedResultTables = Object.keys(expectedResult);

            actualResultTables.forEach((actualResultTable, tableIndex) => {
                assert.strictEqual(actualResultTables[tableIndex], expectedResultTables[tableIndex]);
                const actualColumns = Object.keys(actualResult[actualResultTable]);
                const expectedColumns = Object.keys(expectedResult[actualResultTable]);

                // then do the same with the number of columns and their names
                actualColumns.forEach((actualColumn, columnIndex) => {
                    assert.strictEqual(actualColumns[columnIndex], expectedColumns[columnIndex]);

                    // then check the values for each column
                    const actualProperties = Object.keys(actualResult[actualResultTable][actualColumn]);

                    actualProperties.forEach((actualProperty) => {
                        assert.strictEqual(actualResult[actualResultTable][actualColumn][actualProperty], expectedResult[actualResultTable][actualColumn][actualProperty]);
                    });
                });
            });
        });
    });

    describe('entityCandidatesColumns', function () {
        const queryStub = sinon.stub();
        const dummySession = {
            connection: {
                query: queryStub.resolves()
            },
            results: {},
            schema: 'dummySchema',
            entities: ['foo', 'bar']
        };

        it('returns the correctly updated session object', function () {
            queryStub.onCall(0).callsArgWith(1, null, dummyQueryResults);
            return index.entityCandidatesColumns(dummySession)
                .then((resolvedValue) => {
                    const actualResult = resolvedValue.entities;
                    const expectedResult = dummyEntities;

                    // first check we have the exact same number of tables, and the tables have the same name
                    const actualResultTables = Object.keys(actualResult);
                    const expectedResultTables = Object.keys(expectedResult);

                    actualResultTables.forEach((actualResultTable, tableIndex) => {
                        assert.strictEqual(actualResultTables[tableIndex], expectedResultTables[tableIndex]);
                        const actualColumns = Object.keys(actualResult[actualResultTable]);
                        const expectedColumns = Object.keys(expectedResult[actualResultTable]);

                        // then do the same with the number of columns and their names
                        actualColumns.forEach((actualColumn, columnIndex) => {
                            assert.strictEqual(actualColumns[columnIndex], expectedColumns[columnIndex]);

                            // then check the values for each column
                            const actualProperties = Object.keys(actualResult[actualResultTable][actualColumn]);

                            actualProperties.forEach((actualProperty) => {
                                assert.strictEqual(actualResult[actualResultTable][actualColumn][actualProperty], expectedResult[actualResultTable][actualColumn][actualProperty]);
                            });
                        });
                    });
                });
        });

        it('rejects an error when it should reject an error', function () {
            const dummyError = {};
            queryStub.callsArgWith(1, dummyError);

            return index.entityCandidatesColumns(dummySession)
                .then(() => {
                    assert.fail('promise should be rejected');
                }, (error) => {
                    assert.strictEqual(error, dummyError);
                });
        });
    });
});
