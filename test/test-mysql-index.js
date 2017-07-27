const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const index = require('../lib/mysql/index');

const sandbox = sinon.sandbox.create();

describe('lib/mysql/index', function () {
    afterEach(function () {
        sandbox.restore();
    });

    describe('connect', function () {
        let createConnectionStub;
        let errorMock;
        let logStub;

        beforeEach(function () {
            createConnectionStub = sandbox.stub(mysql, 'createConnection').returns({
                // This is the method actually doing the connection, we must mock it too
                connect: (errorHandlingCallback) => { errorHandlingCallback(errorMock); }
            });
            logStub = sandbox.stub(console, 'log');
        });

        it('uses provided parameters to create connection', function () {
            // These are not valid credentials but it enables me to check references
            const credentials = {
                host: {},
                port: {},
                user: {},
                password: {}
            };
            index.connect(credentials);

            assert.equal(createConnectionStub.firstCall.args[0].host, credentials.host);
            assert.equal(createConnectionStub.firstCall.args[0].port, credentials.port);
            assert.equal(createConnectionStub.firstCall.args[0].user, credentials.user);
            assert.equal(createConnectionStub.firstCall.args[0].password, credentials.password);
        });

        it('doesn\' log when there is no error', function () {
            errorMock = null;
            index.connect({});

            assert.equal(logStub.callCount, 0, 'callCount');
        });

        it('logs the correct error message when there is one', function () {
            errorMock = 'Helpful information about the error the just occured';
            index.connect({});

            assert.equal(logStub.callCount, 1, 'callCount');
            assert.equal(logStub.firstCall.args[0], `error connecting : ${errorMock}`);
        });
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
});

