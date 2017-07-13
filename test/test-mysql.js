const assert = require('assert');

const dbiMysql = require('../lib/mysql.js');

describe('mysql.js', function() {
    describe('validateMysqlCredentials', function () {
        it('returns true when credentials are ok', function () {
            const goodCred = {
                host: '',
                user: 'root',
                password: 'password',
                databaseType: 'mysql',
                database: 'vaticano_secret_archives'
            };
            assert(dbiMysql.validateCredentials(goodCred) === true);
        });
        // TODO: increase coverage (see Istanbul)
    });
});