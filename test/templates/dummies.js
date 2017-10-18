const dummyEntities = {
    authors: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        name: { ordinalPosition: 2, columnType: 'varchar(255)' },
        birth_date: { ordinalPosition: 3, columnType: 'date' }
    },
    books: {
        id: { ordinalPosition: 1, columnType: 'int(11)' },
        title: { ordinalPosition: 2, columnType: 'varchar(255)' },
        price: { ordinalPosition: 3, columnType: 'bigint(20)' },
        author: { ordinalPosition: 4, columnType: 'int(11)' }
    }
};


const dummyQueryResults = [
    {
        table_name: 'authors',
        column_name: 'id',
        ordinal_position: 1,
        column_type: 'int(11)'
    }, {
        table_name: 'authors',
        column_name: 'name',
        ordinal_position: 2,
        column_type: 'varchar(255)'
    }, {
        table_name: 'authors',
        column_name: 'birth_date',
        ordinal_position: 3,
        column_type: 'date'
    }, {
        table_name: 'books',
        column_name: 'id',
        ordinal_position: 1,
        column_type: 'int(11)'
    }, {
        table_name: 'books',
        column_name: 'title',
        ordinal_position: 2,
        column_type: 'varchar(255)'
    }, {
        table_name: 'books',
        column_name: 'price',
        ordinal_position: 3,
        column_type: 'bigint(20)'
    }, {
        table_name: 'books',
        column_name: 'author',
        ordinal_position: 4,
        column_type: 'int(11)'
    }
];


// template choices, generated with dbi_book_author
const expectedColumnsSelectionChoices = [
    { type: 'separator', line: '\u001b[2mauthors\u001b[22m' },
    { name: 'id (int(11))', value: 'authors.id', checked: true },
    { name: 'name (varchar(255))', value: 'authors.name', checked: true },
    { name: 'birth_date (date)', value: 'authors.birth_date', checked: true },
    { type: 'separator', line: '\u001b[2mbooks\u001b[22m' },
    { name: 'id (int(11))', value: 'books.id', checked: true },
    { name: 'title (varchar(255))', value: 'books.title', checked: true },
    { name: 'price (bigint(20))', value: 'books.price', checked: true },
    { name: 'author (int(11))', value: 'books.author', checked: true }
];


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


module.exports = {
    dummyEntities,
    dummyQueryResults,
    expectedColumnsSelectionChoices,
    liquibaseQuery,
    jhipsterQuery,
    manyToManyQuery,
    manyToOneQuery,
    oneToOneQuery,
    columnsQuery,
    columnsQueryWhenNoTables,
    twoTypeJunctionQueryWithoutFilter,
    twoTypeJunctionQueryWithFilter,
    allColumnsQueryWithFilter,
    allColumnsQueryWithoutFilter,
    tablesQueryWithFilter,
    tablesQueryWithoutFilter
};
