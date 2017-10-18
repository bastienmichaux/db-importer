/**
 * @file Unit test for lib/mysql/queries.js
 */

const assert = require('assert');
const mysql = require('mysql');


const dummies = require('./templates/dummies');
const queries = require('../lib/mysql/queries');


const dummySchema = mysql.escape('dummy_schema');
const dummyFilter = mysql.escape(['filtered_table_1', 'filtered_table_2', 'last_filtered_table']);
const dummyTables = mysql.escape(['table_1', 'table_2', 'last_table']);


describe('lib/mysql/queries', function () {
    describe('liquibase', function () {
        it('returns the expected query', function () {
            const liquibaseQuery = dummies.liquibaseQuery;
            assert.strictEqual(queries.liquibase(dummySchema), liquibaseQuery);
        });
    });

    describe('jhipster', function () {
        it('returns the expected query', function () {
            const jhipsterQuery = dummies.jhipsterQuery;
            assert.strictEqual(queries.jhipster(dummySchema), jhipsterQuery);
        });
    });

    describe('manyToMany', function () {
        it('returns the expected query', function () {
            const manyToManyQuery = dummies.manyToManyQuery;
            assert.strictEqual(queries.manyToMany(dummySchema), manyToManyQuery);
        });
    });

    describe('manyToOne', function () {
        it('returns the expected query', function () {
            const manyToOneQuery = dummies.manyToOneQuery;
            assert.strictEqual(queries.manyToOne(dummySchema), manyToOneQuery);
        });
    });

    describe('oneToOne', function () {
        it('returns the expected query', function () {
            const oneToOneQuery = dummies.oneToOneQuery;
            assert.strictEqual(queries.oneToOne(dummySchema), oneToOneQuery);
        });
    });

    describe('columns', function () {
        it('returns query that only retrieves the given tables', function () {
            const columnsQuery = dummies.columnsQuery;
            assert.strictEqual(queries.columns(dummySchema, dummyTables), columnsQuery);
        });

        it('returns query that doesn\'t exclude more tables', function () {
            const columnsQueryWhenNoTables = dummies.columnsQueryWhenNoTables;
            assert.strictEqual(queries.columns(dummySchema, ''), columnsQueryWhenNoTables);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.columns(['dummy_schema'], null), TypeError);
            assert.throws(() => queries.columns(dummySchema, null), TypeError);
        });
    });

    describe('allColumns', function () {
        it('returns query retrieving all the columns for the given tables', function () {
            const allColumnsQueryWithFilter = dummies.allColumnsQueryWithFilter;
            assert.strictEqual(queries.allColumns(dummySchema, dummyTables), allColumnsQueryWithFilter);
        });

        it('returns query retrieving all columns without excluding tables', function () {
            const allColumnsQueryWithoutFilter = dummies.allColumnsQueryWithoutFilter;
            assert.strictEqual(queries.allColumns(dummySchema, ''), allColumnsQueryWithoutFilter);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.allColumns(['dummy_schema'], null), TypeError);
            assert.throws(() => queries.allColumns(dummySchema, null), TypeError);
        });
    });


    describe('twoTypeJunction', function () {
        it('returns query that excludes tables according to their TABLE_NAME', function () {
            const twoTypeJunctionQueryWithFilter = dummies.twoTypeJunctionQueryWithFilter;
            assert.strictEqual(queries.twoTypeJunction(dummySchema, dummyFilter), twoTypeJunctionQueryWithFilter);
        });

        it('returns query that doesn\'t that excludes tables according to their TABLE_NAME', function () {
            const twoTypeJunctionQueryWithoutFilter = dummies.twoTypeJunctionQueryWithoutFilter;
            assert.strictEqual(queries.twoTypeJunction(dummySchema, ''), twoTypeJunctionQueryWithoutFilter);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.twoTypeJunction(['dummy_schema'], null), TypeError); // 1st param throws error
            assert.throws(() => queries.twoTypeJunction(dummySchema, null), TypeError); // 2nd param throws error
        });
    });

    describe('tables', function () {
        it('returns query that excludes tables according to their TABLE_NAME', function () {
            const tablesQueryWithFilter = dummies.tablesQueryWithFilter;
            assert.strictEqual(queries.tables(dummySchema, dummyFilter), tablesQueryWithFilter);
        });

        it('returns query that doesn\'t that excludes tables according to their TABLE_NAME', function () {
            const tablesQueryWithoutFilter = dummies.tablesQueryWithoutFilter;
            assert.strictEqual(queries.tables(dummySchema, ''), tablesQueryWithoutFilter);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.tables(['dummy_schema'], null), TypeError);
            assert.throws(() => queries.tables(dummySchema, null), TypeError);
        });
    });
});
