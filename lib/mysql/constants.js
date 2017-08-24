/**
 * @file MYSQL constants
 */


/**
 * Name of the database that stores information about
 * all the other databases maintained by the MYSQL server.
 *
 * @constant {string}
 * @see {@link https://dev.mysql.com/doc/refman/5.7/en/information-schema.html|MYSQL doc}
 */
const metaDatabase = 'information_schema';


/**
 * Queries passed to the mysql driver. Each query gets a category of tables.
 * Each category is presented separated from the other in the table list
 * when retrieving the tables from a given database schema.
 *
 * @enum {string}
 */
const queries = {
    liquibase: `
SELECT tab.TABLE_NAME

FROM TABLES tab

WHERE TABLE_SCHEMA = :schema
      AND tab.TABLE_NAME IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
;`,
    jhipster: `
SELECT tab.TABLE_NAME

FROM TABLES tab

WHERE TABLE_SCHEMA = :schema
      AND tab.TABLE_NAME LIKE 'jhi\\_%'
;`,
    twoTypeJunction: `
SELECT ke.TABLE_NAME

FROM KEY_COLUMN_USAGE ke

LEFT JOIN COLUMNS col
    ON col.TABLE_NAME = ke.TABLE_NAME
        AND col.COLUMN_NAME = ke.COLUMN_NAME
        AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = :schema
    -- it's not a constraint if there are no referenced table
    AND ke.REFERENCED_TABLE_NAME IS NOT NULL
    -- only junction tables
    AND col.COLUMN_KEY = 'PRI'
    AND ke.TABLE_NAME NOT IN (:filter)

    -- junction tables appear once per referenced table
    GROUP BY ke.TABLE_NAME
    -- only want junction between two tables
    HAVING COUNT(ke.TABLE_NAME) = 2
;`,
    tables: `
SELECT tab.TABLE_NAME

FROM TABLES tab

WHERE TABLE_SCHEMA = :schema
      -- exclude views and alike
      AND TABLE_TYPE LIKE 'BASE TABLE'
      AND tab.TABLE_NAME NOT IN (:filter)
;`
};


/**
 * Values used to map results when retrieving tables
 *
 * @enum {string}
 */
const fields = {
    tableName: 'TABLE_NAME'
};


module.exports = {
    metaDatabase,
    queries,
    fields
};
