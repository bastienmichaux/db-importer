/* global describe, beforeEach, it*/
/* eslint-disable no-unused-vars, prefer-arrow-callback */

const assert = require('assert');

const base = require('../lib/base.js');

describe('base.js', function () {
    describe('objectValuesToArray', function () {
        it('works as expected', function () {
            const obj = {
                a: 42,
                b: 'foo',
                c: [1, 2, 3],
                d: false,
                e: null
            };
            const arr = [
                42,
                'foo',
                [1, 2, 3],
                false,
                null
            ];
            assert.deepStrictEqual(arr, base.objectValuesToArray(obj));
        });
    });
    
    describe('validateDatabaseType', function () {
        it('works as expected', function () {
            assert(base.validateDatabaseType('mariadb'));
            assert(base.validateDatabaseType('mssql'));
            assert(base.validateDatabaseType('mysql'));
            assert(base.validateDatabaseType('oracle'));
            assert(base.validateDatabaseType('postgresql'));
            assert(base.validateDatabaseType('sqlite'));

            assert(base.validateDatabaseType('MariaDB '));
            assert(base.validateDatabaseType(' MSSQL '));
            assert(base.validateDatabaseType(' MySQL'));
            assert(base.validateDatabaseType('Oracle\t'));
            assert(base.validateDatabaseType('PostgreSQL\n'));
            assert(base.validateDatabaseType('SQLite'));

            assert(base.validateDatabaseType('') === false);

            assert(base.validateDatabaseType('cassandra') === false);
            assert(base.validateDatabaseType('mongodb') === false);
        });
    });
    
    describe('validateMysqlCredentials', function () {
        it('returns true when credentials are ok', function () {
            const goodCred = {
                host: '',
                username: 'root',
                password: 'password',
                databaseType: 'mysql',
                database: 'vaticano_secret_archives'
            };
            assert(base.validateMysqlCredentials(goodCred));
        });
        // TODO: increase coverage (see Istanbul)
        it('returns a new error when a property is wrong', function () {
            const badCred = {
                host: '',
                username: 'root',
                password: 'password',
                databaseType: 'oracle',
                database: 'vaticano_secret_archives'
            };
            let x = base.validateMysqlCredentials(badCred);
            assert(x.constructor === TypeError);
        });
    });
});
