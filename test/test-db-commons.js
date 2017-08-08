const assert = require('assert');
const sinon = require('sinon');
const lodash = require('lodash');

const db = require('../lib/db-commons');
const cst = require('../constants');
const prompt = require('../prompt');

const sandbox = sinon.sandbox.create();


describe('lib/db-commons', function () {
    let promptMock;
    let anyDriverName;
    let dummySession;

    beforeEach(function () {
        promptMock = sandbox.mock(prompt);

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

                const driverMock = sandbox.mock(driver).expects('connect').once().resolves();
                promptMock.expects('success').once();

                const credentials = {
                    dbms: dbmsName
                };

                return db.connect(credentials).then((session) => {
                    driverMock.verify();
                    promptMock.verify();

                    assert.equal(session.driver, driver);
                });
            });
        });

        it('logs a success message and resolves his completed input', function () {
            const driver = cst.dbmsList[anyDriverName].driver;
            const driverMock = sandbox.mock(driver).expects('connect').once().resolves();
            promptMock.expects('success').once().withArgs(cst.messages.connectionSuccess);

            return db.connect(dummySession).then((session) => {
                driverMock.verify();
                promptMock.verify();

                assert.equal(session, dummySession);
            });
        });

        it('logs an error message and rejects it', function () {
            const driver = cst.dbmsList[anyDriverName].driver;
            const driverMock = sandbox.mock(driver).expects('connect').once().rejects();
            promptMock.expects('failure').once().withArgs(cst.messages.connectionFailure);

            return db.connect(dummySession).then((session) => {
                assert.fail(session, null, 'This promise should have been rejected !');
            }, (sessionError) => {
                driverMock.verify();
                promptMock.verify();

                assert.equal(sessionError, cst.messages.connectionFailure);
            });
        });
    });

    describe('close', function () {
        let dummySession;
        let closeStub;

        beforeEach(function () {
            closeStub = sandbox.stub().resolves();
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
            return db.close(dummySession).then(() => {
                assert.equal(closeStub.firstCall.args[0], dummySession.connection);
                assert.equal(closeStub.firstCall.args[1], dummySession.driver);
            });
        });

        it('resolves the provided session object', function () {
            return db.close(dummySession).then((session) => {
                assert.equal(session, dummySession);
            });
        });
    });
});
