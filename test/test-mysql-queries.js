/**
 * @file Unit test for lib/mysql/queries.js
 */

const assert = require('assert');
const mysql = require('mysql');

const queries = require('../lib/mysql/queries');

const liquibaseQuery = `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = 'dummy_schema'
AND tab.TABLE_NAME IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK');`;


const jhipsterQuery = `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = 'dummy_schema'
AND tab.TABLE_NAME LIKE 'jhi\\_%';`;


const manyToManyQuery = `SELECT
    ke.TABLE_NAME AS 'JUNCTION_TABLE',
    GROUP_CONCAT(ke.COLUMN_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'FOREIGN_KEYS',
    GROUP_CONCAT(ke.REFERENCED_TABLE_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'REFERENCED_TABLES'
FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'
    /* exclude JHipster Tables */
    AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
    /* exclude liquibase tables */
    AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
    /* only relationship constraints, this excludes indexes and alike */
    AND ke.REFERENCED_TABLE_NAME IS NOT NULL
    /* only many-to-many relationships */
    AND col.COLUMN_KEY = 'PRI'

/* ensure we only get junction tables between two tables. */
GROUP BY ke.TABLE_NAME
HAVING COUNT(ke.TABLE_NAME) = 2;`;


const manyToOneQuery = `SELECT
    ke.TABLE_NAME as 'TABLE_FROM',
    ke.COLUMN_NAME as 'COL_FROM',
    ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'
    AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
    /* exclude liquibase tables */
    AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
    /* only relationship constraints, this excludes indexes and alikes */
    AND ke.REFERENCED_TABLE_NAME IS NOT NULL
    /* only many-to-many relationships */
    AND col.COLUMN_KEY = 'MUL';`;


const oneToOneQuery = `SELECT
  ke.TABLE_NAME as 'TABLE_FROM',
  ke.COLUMN_NAME as 'COL_FROM',
  ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

  LEFT JOIN COLUMNS col
    ON col.TABLE_NAME = ke.TABLE_NAME
       AND col.COLUMN_NAME = ke.COLUMN_NAME
       AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'
    AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
    /* exclude liquibase tables */
    AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
    /* only relationship constraints, this excludes indexes and alikes */
    AND ke.REFERENCED_TABLE_NAME IS NOT NULL
    /* only many-to-many relationships */
    AND col.COLUMN_KEY = 'UNI';`;


const columnsQuery = `SELECT table_schema, table_name, column_name, ordinal_position, column_default, is_nullable, data_type, character_maximum_length, character_octet_length, numeric_precision, numeric_scale, datetime_precision
FROM information_schema.columns
WHERE table_schema LIKE 'dummy_schema'
AND table_name IN ('table_1', 'table_2', 'last_table');`;

const columnsQueryWhenNoTables = `SELECT table_schema, table_name, column_name, ordinal_position, column_default, is_nullable, data_type, character_maximum_length, character_octet_length, numeric_precision, numeric_scale, datetime_precision
FROM information_schema.columns
WHERE table_schema LIKE 'dummy_schema'
;`;


const twoTypeJunctionQueryWithoutFilter = `SELECT ke.TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ke
LEFT JOIN INFORMATION_SCHEMA.COLUMNS col ON col.TABLE_NAME = ke.TABLE_NAME AND col.COLUMN_NAME = ke.COLUMN_NAME AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA
WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'
/* it's not a constraint if there are no referenced table */
AND ke.REFERENCED_TABLE_NAME IS NOT NULL
/* only junction tables */
AND col.COLUMN_KEY = 'PRI'

/* junction tables appear once per referenced table */
GROUP BY ke.TABLE_NAME
/* only want junction between two tables */
HAVING COUNT(ke.TABLE_NAME) = 2;`;

const twoTypeJunctionQueryWithFilter = `SELECT ke.TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ke
LEFT JOIN INFORMATION_SCHEMA.COLUMNS col ON col.TABLE_NAME = ke.TABLE_NAME AND col.COLUMN_NAME = ke.COLUMN_NAME AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA
WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'
/* it's not a constraint if there are no referenced table */
AND ke.REFERENCED_TABLE_NAME IS NOT NULL
/* only junction tables */
AND col.COLUMN_KEY = 'PRI'
AND ke.TABLE_NAME NOT IN ('filtered_table_1', 'filtered_table_2', 'last_filtered_table')
/* junction tables appear once per referenced table */
GROUP BY ke.TABLE_NAME
/* only want junction between two tables */
HAVING COUNT(ke.TABLE_NAME) = 2;`;


const allColumnsQueryWithFilter = `SELECT
col.table_name,
col.column_name,
col.ordinal_position,
col.column_type
FROM information_schema.columns col
WHERE col.table_schema LIKE 'dummy_schema'
AND col.table_name IN ('table_1', 'table_2', 'last_table');`;


const allColumnsQueryWithoutFilter = `SELECT
col.table_name,
col.column_name,
col.ordinal_position,
col.column_type
FROM information_schema.columns col
WHERE col.table_schema LIKE 'dummy_schema'
;`;


const tablesQueryWithFilter = `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = 'dummy_schema'
/* exclude views and alike */
AND TABLE_TYPE LIKE 'BASE TABLE'
AND tab.TABLE_NAME NOT IN ('filtered_table_1', 'filtered_table_2', 'last_filtered_table');`;


const tablesQueryWithoutFilter = `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = 'dummy_schema'
/* exclude views and alike */
AND TABLE_TYPE LIKE 'BASE TABLE'
;`;


const dummySchema = mysql.escape('dummy_schema');
const dummyFilter = mysql.escape(['filtered_table_1', 'filtered_table_2', 'last_filtered_table']);
const dummyTables = mysql.escape(['table_1', 'table_2', 'last_table']);

describe('lib/mysql/queries', function () {
    describe('liquibase', function () {
        it('returns the expected query', function () {
            assert.strictEqual(queries.liquibase(dummySchema), liquibaseQuery);
        });
    });

    describe('jhipster', function () {
        it('returns the expected query', function () {
            assert.strictEqual(queries.jhipster(dummySchema), jhipsterQuery);
        });
    });

    describe('manyToMany', function () {
        it('returns the expected query', function () {
            assert.strictEqual(queries.manyToMany(dummySchema), manyToManyQuery);
        });
    });

    describe('manyToOne', function () {
        it('returns the expected query', function () {
            assert.strictEqual(queries.manyToOne(dummySchema), manyToOneQuery);
        });
    });

    describe('oneToOne', function () {
        it('returns the expected query', function () {
            assert.strictEqual(queries.oneToOne(dummySchema), oneToOneQuery);
        });
    });

    describe('columns', function () {
        it('returns query that only retrieves the given tables', function () {
            assert.strictEqual(queries.columns(dummySchema, dummyTables), columnsQuery);
        });

        it('returns query that doesn\'t exclude more tables', function () {
            assert.strictEqual(queries.columns(dummySchema, ''), columnsQueryWhenNoTables);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.columns(['dummy_schema'], null), TypeError);
            assert.throws(() => queries.columns(dummySchema, null), TypeError);
        });
    });

    describe('allColumns', function () {
        it('returns query retrieving all the columns for the given tables', function () {
            assert.strictEqual(queries.allColumns(dummySchema, dummyTables), allColumnsQueryWithFilter);
        });

        it('returns query retrieving all columns without excluding tables', function () {
            assert.strictEqual(queries.allColumns(dummySchema, ''), allColumnsQueryWithoutFilter);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.allColumns(['dummy_schema'], null), TypeError);
            assert.throws(() => queries.allColumns(dummySchema, null), TypeError);
        });
    });


    describe('twoTypeJunction', function () {
        it('returns query that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.twoTypeJunction(dummySchema, dummyFilter), twoTypeJunctionQueryWithFilter);
        });

        it('returns query that doesn\'t that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.twoTypeJunction(dummySchema, ''), twoTypeJunctionQueryWithoutFilter);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.twoTypeJunction(['dummy_schema'], null), TypeError); // 1st param throws error
            assert.throws(() => queries.twoTypeJunction(dummySchema, null), TypeError); // 2nd param throws error
        });
    });

    describe('tables', function () {
        it('returns query that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.tables(dummySchema, dummyFilter), tablesQueryWithFilter);
        });

        it('returns query that doesn\'t that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.tables(dummySchema, ''), tablesQueryWithoutFilter);
        });

        it('throws with parameters that aren\'t strings', function () {
            assert.throws(() => queries.tables(['dummy_schema'], null), TypeError);
            assert.throws(() => queries.tables(dummySchema, null), TypeError);
        });
    });
});
