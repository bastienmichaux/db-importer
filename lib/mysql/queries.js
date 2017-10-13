/**
 * @file SQL queries, currently not used
 */

const escape = require('mysql').escape;


const jhipster = schema => `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = ${escape(schema)}
AND tab.TABLE_NAME LIKE 'jhi\\_%';`;

const liquibase = schema => `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = ${escape(schema)}
AND tab.TABLE_NAME IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK');`;

const manyToManyTablesOnly = (schema, filter) => {
    // if filter is an empty string, do not include the last part of the query
    const conditionFilter = (filter.length > 0 ? `AND ke.TABLE_NAME NOT IN (${escape(filter)})` : '');

    return `SELECT ke.TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ke
LEFT JOIN INFORMATION_SCHEMA.COLUMNS col ON col.TABLE_NAME = ke.TABLE_NAME AND col.COLUMN_NAME = ke.COLUMN_NAME AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA
WHERE ke.REFERENCED_TABLE_SCHEMA = ${escape(schema)}
/* it's not a constraint if there are no referenced table */
AND ke.REFERENCED_TABLE_NAME IS NOT NULL
/* only junction tables */
AND col.COLUMN_KEY = 'PRI'
${conditionFilter}
/* junction tables appear once per referenced table */
GROUP BY ke.TABLE_NAME
/* only want junction between two tables */
HAVING COUNT(ke.TABLE_NAME) = 2;`;
};

const tables = (schema, filter) => {
    // if filter is an empty string, do not include the last part of the query
    const queryFilter = (filter.length > 0 ? `AND tab.TABLE_NAME NOT IN (${escape(filter)})` : '');

    return `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = ${escape(schema)}
/* exclude views and alike */
AND TABLE_TYPE LIKE 'BASE TABLE'
${queryFilter};`;
};


const manyToManyJunction = (schema, tables) => {
    /** To be able to make many-to-many relationships, we need the junction table not to be used as an entity
     * and the two referenced tables to be used as entities
     */
    const conditionTables = tables.length > 0 ? `AND ke.TABLE_NAME NOT IN (${escape(tables)})` : '';
    const conditionReferencedTables = tables.length > 0 ? `AND ke.REFERENCED_TABLE_NAME IN (${escape(tables)})` : '';

    return `SELECT
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
WHERE ke.REFERENCED_TABLE_SCHEMA = ${escape(schema)}
${conditionTables}
${conditionReferencedTables}
/* only relationship constraints, this excludes indexes and alike */
AND ke.REFERENCED_TABLE_NAME IS NOT NULL
/* only many-to-many relationships */
AND col.COLUMN_KEY = 'PRI'
/* ensure we only get junction tables between two tables. */
GROUP BY ke.TABLE_NAME
HAVING COUNT(ke.TABLE_NAME) = 2`;
};


/* returns the query used to retrieve all columns data for the selected tables */
const columns = (schema, tables) => {
    const tablesCondition = (tables.length > 0 ? `AND col.TABLE_NAME IN (${escape(tables)})` : '');

    return `SELECT
col.TABLE_NAME,
GROUP_CONCAT(CONCAT('{"name":"', col.COLUMN_NAME, '","type":"', col.COLUMN_TYPE, '"}' )) AS "COLUMNS"
FROM INFORMATION_SCHEMA.COLUMNS col
WHERE col.TABLE_SCHEMA = ${escape(schema)}
${tablesCondition}
GROUP BY col.TABLE_NAME;`;
};


module.exports = {
    liquibase,
    jhipster,
    manyToManyTablesOnly,
    tables,
    manyToManyJunction,
    columns
};
