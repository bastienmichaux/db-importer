/**
 * @file Unit test for lib/mysql/index.js
 */

const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const cst = require('../lib/mysql/constants');
const index = require('../lib/mysql/index');
const queries = require('../lib/mysql/queries.js');

const sandbox = sinon.sandbox.create();

describe('lib/mysql/index', function () {
    afterEach(function () {
        sandbox.restore();
    });

    describe('queryFormat', function () {
        let queryFormat;
        let dummyQuery;

        before(function () {
            const createConnectionStub = sandbox.stub(mysql, 'createConnection').returns({
                //
                connect: (errorHandlingCallback) => {}
            });
            index.connect({});
            queryFormat = createConnectionStub.firstCall.args[0].queryFormat;

            dummyQuery = 'SELECT uid FROM Users WHERE name = :name AND password = :password';
        });

        it('returns query as is if there are no provided parameters', function () {
            const escapedQuery = queryFormat(dummyQuery);

            assert.equal(escapedQuery, dummyQuery);
        });

        it('tries only to escape named parameters', function () {
            const escapeSpy = sandbox.spy(mysql, 'escape');

            queryFormat(dummyQuery, {
                name: '0',
                password: '1'
            });

            assert.equal(escapeSpy.callCount, 2, 'callCount');
            assert.equal(escapeSpy.args[0], 0);
            assert.equal(escapeSpy.args[1], 1);
        });

        it('replaces parameters by their escaped value', function () {
            const escapedQuery = queryFormat(dummyQuery, {
                name: 'Dupont; \'--',
                password: 5
            });

            assert.equal(escapedQuery, 'SELECT uid FROM Users WHERE name = \'Dupont; \\\'--\' AND password = 5');
        });

        it('throws an error if a named parameter is not provided', function () {
            assert.throws(() => queryFormat(dummyQuery, {}));
        });
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
                assert.equal(createConnectionStub.firstCall.args[0].host, dummyCredentials.host);
                assert.equal(createConnectionStub.firstCall.args[0].port, dummyCredentials.port);
                assert.equal(createConnectionStub.firstCall.args[0].user, dummyCredentials.user);
                assert.equal(createConnectionStub.firstCall.args[0].password, dummyCredentials.password);
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
                assert.equal(error, dummyError);
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
                assert.equal(error, dummyError);
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
                schema: {}
            };
        });

        it('rejects with connection.query error', function () {
            const dummyError = {};
            queryStub.callsArgWith(2, dummyError);

            return index.entityCandidates(dummySession).then(() => {
                assert.fail('promise should be rejected');
            }, (error) => {
                assert.equal(error, dummyError);
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

            queryStub.withArgs(queries.jhipster).callsArgWith(2, null, dummyJhipster);
            queryStub.withArgs(queries.liquibase).callsArgWith(2, null, dummyLiquibase);
            queryStub.withArgs(queries.twoTypeJunction).callsArgWith(2, null, dummyTwoTypeJunction);
            queryStub.withArgs(queries.tables).callsArgWith(2, null, dummyTables);

            return index.entityCandidates(dummySession).then(() => {
                // checking the value
                assert.deepEqual(dummySession.results, dummyResults);

                // checking each reference, that is, it uses the exact 'value' it received
                assert.equal(dummySession.results.jhipster[0], dummyJhipster[0][cst.fields.tableName]);
                assert.equal(dummySession.results.liquibase[0], dummyLiquibase[0][cst.fields.tableName]);
                assert.equal(dummySession.results.twoTypeJunction[0], dummyTwoTypeJunction[0][cst.fields.tableName]);
                assert.equal(dummySession.results.tables[0], dummyTables[0][cst.fields.tableName]);
            });
        });
    });
});

