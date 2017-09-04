/**
 * @file Unit test for constants.js
 */

const assert = require('assert');
const toArray = require('lodash').values;

const cst = require('../constants');
const db = require('../lib/db-commons');


describe('constants', function () {
    describe('inquiries.port.default', function () {
        toArray(db.dbmsList).forEach((dbms) => {
            it(`handles ${dbms.name} correctly`, function () {
                assert.equal(cst.inquiries.port.default({ dbms: dbms.name }), dbms.defaultPort, 'hint: dbms key inside dbmsList and dbmsList.dbms.name must be the same value');
            });
        });

        it('throws an error with a bad parameter', function () {
            assert.throws(() => cst.inquiries.port.default({ dbms: 'definitelyNotADBMS' }), Error);
        });

        it('returns null if input doesn\'t provide a dbms', function () {
            assert.equal(cst.inquiries.port.default({}), null);
        });
    });
});
