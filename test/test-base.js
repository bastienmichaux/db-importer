/* global describe, beforeEach, it*/
/* eslint-disable no-unused-vars, prefer-arrow-callback */

const assert = require('assert');

const base = require('../lib/base.js');

describe('base.js', function () {
    describe('validateDatabaseType', function () {
        it('works as expected', function () {
            assert(base.validateDatabaseType('mysql'));
            assert(base.validateDatabaseType(' MySQL'));

            assert(base.validateDatabaseType('') === false);

            assert(base.validateDatabaseType('cassandra') === false);
            assert(base.validateDatabaseType('mongodb') === false);
        });
    });
});
