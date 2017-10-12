/**
 * @file Unit test for lib/db-commons.js
 */

const assert = require('assert');
const sinon = require('sinon');
const lodash = require('lodash');

const db = require('../lib/db-commons');

const sandbox = sinon.sandbox.create();


describe('lib/db-commons', function () {
    let anyDriverName;
    let dummySession;

    beforeEach(function () {
        // we don't care which dbms, we're mocking it anyway
        anyDriverName = 'mysql';
        dummySession = {
            dbms: anyDriverName
        };
    });

    afterEach(function () {
        sandbox.verifyAndRestore();
    });

    describe('connect', function () {
        const dbmsNameList = lodash.values(lodash.mapValues(db.dbmsList, 'name'));

        dbmsNameList.forEach((dbmsName) => {
            it(`returns an object containing the corresponding ${dbmsName} driver`, function () {
                const driver = db.dbmsList[dbmsName].driver; // the driver we want to find at the end of the test

                sandbox.mock(driver).expects('connect').once().resolves();

                const credentials = {
                    dbms: dbmsName
                };

                return db.connect(credentials).then((session) => {
                    assert.strictEqual(session.driver, driver);
                });
            });
        });

        it('resolves his completed input', function () {
            const driver = db.dbmsList[anyDriverName].driver;

            sandbox.mock(driver).expects('connect').once().resolves();

            return db.connect(dummySession).then((session) => {
                assert.strictEqual(session, dummySession);
            });
        });

        it('removes the password from the session object', function () {
            const driver = db.dbmsList[anyDriverName].driver;
            sandbox.mock(driver).expects('connect').once().resolves();

            dummySession.password = 'verystrongpassword';

            return db.connect(dummySession).then((session) => {
                assert.strictEqual(session.password, undefined);
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
                assert.strictEqual(closeStub.firstCall.args[0], dummySession.connection);
                assert.strictEqual(closeStub.firstCall.args[1], dummySession.driver);
            });
        });

        it('resolves the provided session object', function () {
            return db.close(dummySession).then((session) => {
                assert.strictEqual(session, dummySession);
            });
        });
    });

    describe('entitiesTables', function () {
        let dummySession;
        let entitiesTablesSub;

        beforeEach(function () {
            entitiesTablesSub = sandbox.stub().resolves();
            dummySession = {
                connection: {},
                driver: {
                    entitiesTables: entitiesTablesSub
                }
            };
        });

        afterEach(function () {
            sinon.assert.calledOnce(entitiesTablesSub);
        });

        it('calls the embedded driver entitiesTables method on the provided session', function () {
            return db.entitiesTables(dummySession).then(() => {
                assert.strictEqual(entitiesTablesSub.firstCall.args[0], dummySession);
            });
        });

        it('resolves the provided session object', function () {
            return db.entitiesTables(dummySession).then((session) => {
                assert.strictEqual(session, dummySession);
            });
        });
    });

    describe('entityColumns', function () {
        let dummySession;
        let entityCandidatesColumnsStub;

        beforeEach(function () {
            entityCandidatesColumnsStub = sandbox.stub().resolves();
            dummySession = {
                connection: {},
                driver: {
                    entityColumns: entityCandidatesColumnsStub
                }
            };
        });

        afterEach(function () {
            sinon.assert.calledOnce(entityCandidatesColumnsStub);
        });

        it('ends the session with an undefined value', function () {
            assert(typeof db.entityColumns === 'function');
            return db.entityColumns(dummySession);
        });
    });
});
