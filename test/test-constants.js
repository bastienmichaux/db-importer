const assert = require('assert');
const toArray = require('lodash').values;

const cst = require('../constants');


describe('constants', function () {
    describe('inquiries.port.default', function () {
        toArray(cst.dbmsList).forEach((dbms) => {
            it(`handles ${dbms.name} correctly`, function () {
                assert.equal(cst.inquiries.port.default({ dbms: dbms.name }), dbms.defaultPort, 'hint: dbms key inside dbmsList and dbmsList.dbms.name must be the same value');
            });
        });
    });
});
