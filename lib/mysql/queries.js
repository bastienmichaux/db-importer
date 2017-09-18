/**
 * @file SQL queries, currently not used
 * @todo Integrate these queries in a JSON file {@link https://github.com/bastienmichaux/db-importer/issues/6}
 */

const liquibase = schema => `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = ${schema}
AND tab.TABLE_NAME IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK');`;


const jhipster = schema => `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = ${schema}
AND tab.TABLE_NAME LIKE 'jhi\\_%';`;


const twoTypeJunction = (schema, filter) => {
    if (typeof schema !== 'string') {
        throw new TypeError(`Type of 'schema' parameter should be a string, is ${typeof schema} instead.`);
    }
    if (typeof filter !== 'string') {
        throw new TypeError(`Type of 'filter' parameter should be a string, is ${typeof filter} instead.`);
    }

    // if filter is an empty string, do not include the last part of the query
    const conditionFilter = (filter ? `AND ke.TABLE_NAME NOT IN (${filter})` : '');

    return `SELECT ke.TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ke
LEFT JOIN INFORMATION_SCHEMA.COLUMNS col ON col.TABLE_NAME = ke.TABLE_NAME AND col.COLUMN_NAME = ke.COLUMN_NAME AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA
WHERE ke.REFERENCED_TABLE_SCHEMA = ${schema}
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
    if (typeof schema !== 'string') {
        throw new TypeError(`Type of 'schema' parameter should be a string, is ${typeof schema} instead.`);
    }
    if (typeof filter !== 'string') {
        throw new TypeError(`Type of 'filter' parameter should be a string, is ${typeof filter} instead.`);
    }

    // if filter is an empty string, do not include the last part of the query
    const queryFilter = (filter ? `AND tab.TABLE_NAME NOT IN (${filter})` : '');

    return `SELECT tab.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES tab
WHERE TABLE_SCHEMA = ${schema}
/* exclude views and alike */
AND TABLE_TYPE LIKE 'BASE TABLE'
${queryFilter};`;
};


const columns = (schema, tables) => {
    if (typeof schema !== 'string') {
        throw new TypeError(`Expected 'schemaName' parameter to be a string, was ${typeof schema} instead.\nValue: ${schema}`);
    }
    if (typeof tables !== 'string') {
        throw new TypeError(`Expected 'tables' parameter to be a string, was ${typeof tables} instead.\nValue: ${tables}`);
    }

    const conditionTables = (tables ? `AND table_name IN (${tables})` : '');

    return `SELECT table_schema, table_name, column_name, ordinal_position, column_default, is_nullable, data_type, character_maximum_length, character_octet_length, numeric_precision, numeric_scale, datetime_precision
FROM information_schema.columns
WHERE table_schema LIKE ${schema}
${conditionTables};`;
};


const manyToMany = schema => `SELECT
    ke.TABLE_NAME AS 'JUNCTION_TABLE',
    GROUP_CONCAT(ke.COLUMN_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'FOREIGN_KEYS',
    GROUP_CONCAT(ke.REFERENCED_TABLE_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'REFERENCED_TABLES'
FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = ${schema}
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
HAVING COUNT(ke.TABLE_NAME) = 2;`
;

const manyToOne = schema => `SELECT
    ke.TABLE_NAME as 'TABLE_FROM',
    ke.COLUMN_NAME as 'COL_FROM',
    ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = ${schema}
    AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
    /* exclude liquibase tables */
    AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
    /* only relationship constraints, this excludes indexes and alikes */
    AND ke.REFERENCED_TABLE_NAME IS NOT NULL
    /* only many-to-many relationships */
    AND col.COLUMN_KEY = 'MUL';`
;

const oneToOne = schema => `SELECT
  ke.TABLE_NAME as 'TABLE_FROM',
  ke.COLUMN_NAME as 'COL_FROM',
  ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

  LEFT JOIN COLUMNS col
    ON col.TABLE_NAME = ke.TABLE_NAME
       AND col.COLUMN_NAME = ke.COLUMN_NAME
       AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = ${schema}
    AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
    /* exclude liquibase tables */
    AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
    /* only relationship constraints, this excludes indexes and alikes */
    AND ke.REFERENCED_TABLE_NAME IS NOT NULL
    /* only many-to-many relationships */
    AND col.COLUMN_KEY = 'UNI';`
;

module.exports = {
    liquibase,
    jhipster,
    twoTypeJunction,
    tables,
    columns,
    manyToMany,
    manyToOne,
    oneToOne
};
