const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const index = require('../lib/mysql/index');

const sandbox = sinon.sandbox.create();

describe('lib/mysql/index', function () {
    describe('connect', function () {
        let createConnectionStub;
        let errorMock;
        let logSpy;

        beforeEach(function () {
            createConnectionStub = sandbox.stub(mysql, 'createConnection').returns({
                //
                connect: (errorHandlingCallback) => { errorHandlingCallback(errorMock); }
            });
            logSpy = sandbox.spy(console, 'log');
        });

        afterEach(function () {
            // I restore original functions after each test
            // I must do so mocks from previous tests don't interfere with following tests
            sandbox.restore();
        });

        it('creates connection with provided parameters', function () {
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

            assert.equal(logSpy.callCount, 0);
        });

        it('logs the correct error message when there is one', function () {
            errorMock = 'Helpful information about the error the just occured';
            index.connect({});

            assert.equal(logSpy.callCount, 1);
            assert.equal(logSpy.firstCall.args[0], `error connecting : ${errorMock}`);
        });
    });
});

