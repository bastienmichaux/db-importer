const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const index = require('../lib/mysql/index');

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
        it('provides connection.query with parameters')
    });
});

