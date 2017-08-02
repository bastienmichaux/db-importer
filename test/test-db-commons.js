const assert = require('assert');
const sinon = require('sinon');
const lodash = require('lodash');

const db = require('../lib/db-commons');
const cst = require('../constants');

const sandbox = sinon.sandbox.create();


describe('lib/db-commons', function () {
    let logStub;
    let anyDriverName;
    let dummySession;

    beforeEach(function () {
        // we don't want logs to pollute test output
        logStub = sandbox.stub(console, 'log');
        logStub.withArgs(cst.messages.connectionSuccess).returns(null);
        // we still want mocha to be able to log
        logStub.callThrough();

        // we don't care which dbms, we're mocking it anyway
        anyDriverName = 'mysql';
        dummySession = {
            dbms: anyDriverName
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('connect', function () {
        const dbmsNameList = lodash.values(lodash.mapValues(cst.dbmsList, 'name'));

        dbmsNameList.forEach((dbmsName) => {
            it(`returns an object containing the corresponding ${dbmsName} driver`, function () {
                const driver = cst.dbmsList[dbmsName].driver; // the driver we want to find at the end of the test

                const driverMock = sandbox.mock(driver)
                    .expects('connect')
                    .once()
                    .resolves();

                const credentials = {
                    dbms: dbmsName
                };

                return db.connect(credentials).then((session) => {
                    driverMock.verify();
                    sinon.assert.calledOnce(logStub);

                    assert.equal(session.driver, driver);
                });
            });
        });

        it('logs a success message and resolves his completed input', function () {
            const driver = cst.dbmsList[anyDriverName].driver;
            const driverMock = sandbox.mock(driver)
                .expects('connect')
                .once()
                .resolves();

            return db.connect(dummySession).then((session) => {
                driverMock.verify();
                sinon.assert.calledOnce(logStub);

                assert.equal(logStub.firstCall.args[0], cst.messages.connectionSuccess);
                assert.equal(session, dummySession);
            });
        });

        it('logs an error message and throws an error', function () {
            const driver = cst.dbmsList[anyDriverName].driver;
            const driverMock = sandbox.mock(driver)
                .expects('connect')
                .once()
                .rejects();

            const errorStub = sandbox.stub(console, 'error');
            errorStub.withArgs(cst.messages.connectionFailure).returns(null);
            errorStub.callThrough();


            return db.connect(dummySession).then((session) => {
                assert.fail(session, null, 'This promise should have been rejected !');
            }, (sessionError) => {
                driverMock.verify();

                sinon.assert.calledOnce(errorStub);
                assert.equal(errorStub.firstCall.args[0], cst.messages.connectionFailure);
                assert.equal(sessionError, cst.messages.connectionFailure);
            });
        });
    });

    describe('close', function () {
        let dummySession;
        let closeStub;

        beforeEach(function () {
            closeStub = sandbox.stub();
            dummySession = {
                connection: {},
                driver: {
                    close: closeStub
                }
            };
        });

        afterEach(function () {
            sinon.assert.calledOnce(closeStub);
        });

        it('calls the embedded driver close method on the embedded connection', function () {
            db.close(dummySession);

            assert.equal(closeStub.firstCall.args[0], dummySession.connection);
            assert.equal(closeStub.firstCall.args[1], dummySession.driver);
        });

        it('returns the provided session object', function () {
            assert.equal(db.close(dummySession), dummySession);
        });
    });
});
