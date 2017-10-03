/**
 * @file Unit test for lib/mysql/index.js
 */

const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const cst = require('../lib/mysql/constants');
const dummies = require('./templates/dummies.js');
const index = require('../lib/mysql/index');

const sandbox = sinon.sandbox.create();

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

        const dummyTables = ['authors', 'books'];

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
        const dummyQueryResults = dummies.dummyQueryResults;

        const dummyEntities = dummies.dummyEntities;

        it('returns an organized object representing the database structure', function () {
            const actualResult = index.organizeColumns(dummyQueryResults);
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

        const dummyQueryResults = [
            {
                table_name: 'authors',
                column_name: 'id',
                ordinal_position: 1,
                column_default: null,
                is_nullable: 'NO',
                data_type: 'int',
                character_maximum_length: null,
                character_octet_length: null,
                numeric_precision: 10,
                numeric_scale: 0,
                datetime_precision: null,
                character_set_name: null,
                collation_name: null,
                column_type: 'int(11)',
                column_comment: ''
            }, {
                table_name: 'authors',
                column_name: 'name',
                ordinal_position: 2,
                column_default: null,
                is_nullable: 'YES',
                data_type: 'varchar',
                character_maximum_length: 255,
                character_octet_length: 765,
                numeric_precision: null,
                numeric_scale: null,
                datetime_precision: null,
                character_set_name: 'utf8',
                collation_name: 'utf8_general_ci',
                column_type: 'varchar(255)',
                column_comment: ''
            }, {
                table_name: 'authors',
                column_name: 'birth_date',
                ordinal_position: 3,
                column_default: null,
                is_nullable: 'YES',
                data_type: 'date',
                character_maximum_length: null,
                character_octet_length: null,
                numeric_precision: null,
                numeric_scale: null,
                datetime_precision: null,
                character_set_name: null,
                collation_name: null,
                column_type: 'date',
                column_comment: ''
            }, {
                table_name: 'books',
                column_name: 'id',
                ordinal_position: 1,
                column_default: null,
                is_nullable: 'NO',
                data_type: 'int',
                character_maximum_length: null,
                character_octet_length: null,
                numeric_precision: 10,
                numeric_scale: 0,
                datetime_precision: null,
                character_set_name: null,
                collation_name: null,
                column_type: 'int(11)',
                column_comment: ''
            }, {
                table_name: 'books',
                column_name: 'title',
                ordinal_position: 2,
                column_default: null,
                is_nullable: 'YES',
                data_type: 'varchar',
                character_maximum_length: 255,
                character_octet_length: 765,
                numeric_precision: null,
                numeric_scale: null,
                datetime_precision: null,
                character_set_name: 'utf8',
                collation_name: 'utf8_general_ci',
                column_type: 'varchar(255)',
                column_comment: ''
            }, {
                table_name: 'books',
                column_name: 'description',
                ordinal_position: 3,
                column_default: null,
                is_nullable: 'YES',
                data_type: 'varchar',
                character_maximum_length: 255,
                character_octet_length: 765,
                numeric_precision: null,
                numeric_scale: null,
                datetime_precision: null,
                character_set_name: 'utf8',
                collation_name: 'utf8_general_ci',
                column_type: 'varchar(255)',
                column_comment: ''
            }, {
                table_name: 'books',
                column_name: 'publication_date',
                ordinal_position: 4,
                column_default: null,
                is_nullable: 'YES',
                data_type: 'date',
                character_maximum_length: null,
                character_octet_length: null,
                numeric_precision: null,
                numeric_scale: null,
                datetime_precision: null,
                character_set_name: null,
                collation_name: null,
                column_type: 'date',
                column_comment: ''
            }, {
                table_name: 'books',
                column_name: 'price',
                ordinal_position: 5,
                column_default: null,
                is_nullable: 'YES',
                data_type: 'bigint',
                character_maximum_length: null,
                character_octet_length: null,
                numeric_precision: 19,
                numeric_scale: 0,
                datetime_precision: null,
                character_set_name: null,
                collation_name: null,
                column_type: 'bigint(20)',
                column_comment: ''
            }, {
                table_name: 'books',
                column_name: 'author',
                ordinal_position: 6,
                column_default: null,
                is_nullable: 'NO',
                data_type: 'int',
                character_maximum_length: null,
                character_octet_length: null,
                numeric_precision: 10,
                numeric_scale: 0,
                datetime_precision: null,
                character_set_name: null,
                collation_name: null,
                column_type: 'int(11)',
                column_comment: ''
            }
        ];

        const dummySession = {
            connection: {
                query: queryStub.resolves()
            },
            results: {},
            schema: 'dummySchema',
            entities: ['foo', 'bar']
        };

        const dummyEntities = dummies.dummyEntities;

        const dummySchema = dummySession.schema;

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
