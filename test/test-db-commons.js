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
            it('returns an object containing the driver and an established connection', function () {
                const driver = cst.dbmsList[dbmsName].driver;
                const dummyConnection = {};
                const driverMock = sandbox.mock(driver)
                    .expects('connect')
                    .once()
                    .returns(dummyConnection);

                const credentials = {
                    dbms: dbmsName
                };

                const session = db.connect(credentials);

                driverMock.verify();

                assert.equal(session.driver, driver);
                assert.equal(session.connection, dummyConnection);
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
