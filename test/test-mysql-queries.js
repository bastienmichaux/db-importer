/**
 * @file Unit test for lib/mysql/queries.js
 */

const assert = require('assert');

const queries = require('../lib/mysql/queries');


const liquibaseQuery = `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = 'dummy_schema'
AND tab.TABLE_NAME IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK');`;

const jhipsterQuery = `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = 'dummy_schema'
AND tab.TABLE_NAME LIKE 'jhi\\_%';`;

const manyToManyTablesOnlyWithoutFilter = `SELECT ke.TABLE_NAME
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

const manyToManyTablesOnlyWithFilter = `SELECT ke.TABLE_NAME
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

const manyToManyJunctionWithoutTables = `SELECT
ke.TABLE_NAME AS 'JUNCTION_TABLE',
CONCAT('[',
		GROUP_CONCAT(CONCAT('{"key":"' , ke.COLUMN_NAME,
                            '","keyType":"', col.COLUMN_TYPE,
          		         	'","referencedTable":"', ke.REFERENCED_TABLE_NAME,
          		         	'","referencedColumnName":"', ke.REFERENCED_COLUMN_NAME, '"}') ORDER BY ke.REFERENCED_TABLE_NAME ASC),
       ']') AS 'REFERENCES'
FROM KEY_COLUMN_USAGE ke
LEFT JOIN COLUMNS col
ON col.TABLE_NAME = ke.TABLE_NAME
AND col.COLUMN_NAME = ke.COLUMN_NAME
AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA
WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'


/* only relationship constraints, this excludes indexes and alike */
AND ke.REFERENCED_TABLE_NAME IS NOT NULL
/* only many-to-many relationships */
AND col.COLUMN_KEY = 'PRI'
/* ensure we only get junction tables between two tables. */
GROUP BY ke.TABLE_NAME
HAVING COUNT(ke.TABLE_NAME) = 2`;

const manyToManyJunctionWithTables = `SELECT
ke.TABLE_NAME AS 'JUNCTION_TABLE',
CONCAT('[',
		GROUP_CONCAT(CONCAT('{"key":"' , ke.COLUMN_NAME,
                            '","keyType":"', col.COLUMN_TYPE,
          		         	'","referencedTable":"', ke.REFERENCED_TABLE_NAME,
          		         	'","referencedColumnName":"', ke.REFERENCED_COLUMN_NAME, '"}') ORDER BY ke.REFERENCED_TABLE_NAME ASC),
       ']') AS 'REFERENCES'
FROM KEY_COLUMN_USAGE ke
LEFT JOIN COLUMNS col
ON col.TABLE_NAME = ke.TABLE_NAME
AND col.COLUMN_NAME = ke.COLUMN_NAME
AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA
WHERE ke.REFERENCED_TABLE_SCHEMA = 'dummy_schema'
AND ke.TABLE_NAME NOT IN ('table_1', 'table_2', 'last_table')
AND ke.REFERENCED_TABLE_NAME IN ('table_1', 'table_2', 'last_table')
/* only relationship constraints, this excludes indexes and alike */
AND ke.REFERENCED_TABLE_NAME IS NOT NULL
/* only many-to-many relationships */
AND col.COLUMN_KEY = 'PRI'
/* ensure we only get junction tables between two tables. */
GROUP BY ke.TABLE_NAME
HAVING COUNT(ke.TABLE_NAME) = 2`;

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

const columnsQueryWithFilter = `SELECT
col.TABLE_NAME,
CONCAT('[',
		GROUP_CONCAT(CONCAT('{"name":"', col.COLUMN_NAME, 
                            '","type":"', col.COLUMN_TYPE, '"}' )),
		']') AS "COLUMNS"
FROM INFORMATION_SCHEMA.COLUMNS col
WHERE col.TABLE_SCHEMA = 'dummy_schema'
AND col.TABLE_NAME IN ('table_1', 'table_2', 'last_table')
GROUP BY col.TABLE_NAME;`;

const columnsQueryWithoutFilter = `SELECT
col.TABLE_NAME,
CONCAT('[',
		GROUP_CONCAT(CONCAT('{"name":"', col.COLUMN_NAME, 
                            '","type":"', col.COLUMN_TYPE, '"}' )),
		']') AS "COLUMNS"
FROM INFORMATION_SCHEMA.COLUMNS col
WHERE col.TABLE_SCHEMA = 'dummy_schema'

GROUP BY col.TABLE_NAME;`;

const dummySchema = 'dummy_schema';
const dummyFilter = ['filtered_table_1', 'filtered_table_2', 'last_filtered_table'];
const dummyTables = ['table_1', 'table_2', 'last_table'];

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

    describe('manyToManyTablesOnly', function () {
        it('returns query that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.manyToManyTablesOnly(dummySchema, dummyFilter), manyToManyTablesOnlyWithFilter);
        });

        it('returns query that doesn\'t excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.manyToManyTablesOnly(dummySchema, ''), manyToManyTablesOnlyWithoutFilter);
        });
    });

    describe('tables', function () {
        it('returns query that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.tables(dummySchema, dummyFilter), tablesQueryWithFilter);
        });

        it('returns query that doesn\'t that excludes tables according to their TABLE_NAME', function () {
            assert.strictEqual(queries.tables(dummySchema, ''), tablesQueryWithoutFilter);
        });
    });

    describe('manyToManyJunction', function () {
        it('returns query that uses tables', function () {
            assert.strictEqual(queries.manyToManyJunction(dummySchema, dummyTables), manyToManyJunctionWithTables);
        });

        it('returns query that doesn\'t use tables', function () {
            assert.strictEqual(queries.manyToManyJunction(dummySchema, ''), manyToManyJunctionWithoutTables);
        });
    });

    describe('columns', function () {
        it('returns query retrieving all the columns for the given tables', function () {
            assert.strictEqual(queries.columns(dummySchema, dummyTables), columnsQueryWithFilter);
        });

        it('returns query retrieving all columns without excluding tables', function () {
            assert.strictEqual(queries.columns(dummySchema, ''), columnsQueryWithoutFilter);
        });
    });
});
