const assert = require('assert');
const sinon = require('sinon');
const lodash = require('lodash');

const db = require('../lib/db-commons');
const cst = require('../constants');

const sandbox = sinon.sandbox.create();


describe('lib/db-commons', function () {
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

                    assert.equal(session.driver, driver);
                });
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
