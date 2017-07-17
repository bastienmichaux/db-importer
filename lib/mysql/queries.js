function tables(database, connection) {
    return `
SELECT tab.TABLE_NAME

FROM TABLES tab

WHERE TABLE_SCHEMA = ${connection.escape(database)}
      AND tab.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND tab.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- exclude views and alike
      AND TABLE_TYPE LIKE 'BASE TABLE'
      -- exclude junction tables
      AND tab.TABLE_NAME NOT IN (
        SELECT ke.TABLE_NAME

        FROM KEY_COLUMN_USAGE ke

          LEFT JOIN COLUMNS col
            ON col.TABLE_NAME = ke.TABLE_NAME
               AND col.COLUMN_NAME = ke.COLUMN_NAME
               AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

        WHERE ke.REFERENCED_TABLE_SCHEMA = ${connection.escape(database)}
              AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
              -- exclude liquibase tables
              AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
              -- it's not a constraint if there are no referenced table
              AND ke.REFERENCED_TABLE_NAME IS NOT NULL
              -- only junction tables
              AND col.COLUMN_KEY = 'PRI'

        -- junction tables appear once per referenced table
        GROUP BY ke.TABLE_NAME
        -- only want junction between two tables
        HAVING COUNT(ke.TABLE_NAME) = 2
)
;`
        ;
}

function columns(database, connection) {
    return `
SELECT
    tab.TABLE_NAME,
    col.COLUMN_NAME,
    col.DATA_TYPE

FROM TABLES tab

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = tab.TABLE_NAME
           AND col.TABLE_SCHEMA = tab.TABLE_SCHEMA

    -- help to know which column correspond to a constraint (and exclude it)
    LEFT JOIN KEY_COLUMN_USAGE ke
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND ke.TABLE_SCHEMA = col.TABLE_SCHEMA

-- chosen database
WHERE tab.TABLE_SCHEMA = ${connection.escape(database)}
      -- exclude JHipster own tables
      AND tab.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- exclude views and alike
      AND TABLE_TYPE LIKE 'BASE TABLE'
      -- exclude foreign keys, this automatically exclude junction tables
      AND ke.REFERENCED_TABLE_NAME IS NULL
;`
        ;
}

function manyToMany(database, connection) {
    return `
SELECT
    ke.TABLE_NAME AS 'JUNCTION_TABLE',
    GROUP_CONCAT(ke.COLUMN_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'FOREIGN_KEYS',
    GROUP_CONCAT(ke.REFERENCED_TABLE_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'REFERENCED_TABLES'
FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = ${connection.escape(database)}
      -- exclude JHipster Tables
      AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alike
      AND ke.REFERENCED_TABLE_NAME IS NOT NULL
      -- only many-to-many relationships
      AND col.COLUMN_KEY = 'PRI'

-- ensure we only get junction tables between two tables.
GROUP BY ke.TABLE_NAME
HAVING COUNT(ke.TABLE_NAME) = 2
;`
    ;
}

function manyToOne(database, connection) {
    return `
SELECT
    ke.TABLE_NAME as 'TABLE_FROM',
    ke.COLUMN_NAME as 'COL_FROM',
    ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = ${connection.escape(database)}
      AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alikes
      AND ke.REFERENCED_TABLE_NAME IS NOT NULL
      -- only many-to-many relationships
      AND col.COLUMN_KEY = 'MUL'
;`
        ;
}

function oneToOne(database, connection) {
    return `
SELECT
  ke.TABLE_NAME as 'TABLE_FROM',
  ke.COLUMN_NAME as 'COL_FROM',
  ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

  LEFT JOIN COLUMNS col
    ON col.TABLE_NAME = ke.TABLE_NAME
       AND col.COLUMN_NAME = ke.COLUMN_NAME
       AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = ${connection.escape(database)}
      AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alikes
      AND ke.REFERENCED_TABLE_NAME IS NOT NULL
      -- only many-to-many relationships
      AND col.COLUMN_KEY = 'UNI'
;`
    ;
}

module.exports = {
    tables,
    columns,
    manyToMany,
    manyToOne,
    oneToOne
};
