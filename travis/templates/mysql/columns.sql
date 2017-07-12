SELECT
    tab.`TABLE_NAME`,
    col.`COLUMN_NAME`

FROM TABLES tab

    LEFT JOIN COLUMNS col
        ON col.`TABLE_NAME` = tab.`TABLE_NAME`

    -- help to know which column correspond to a constraint (and exclude it)
    LEFT JOIN KEY_COLUMN_USAGE ke
        ON col.`TABLE_NAME` = ke.`TABLE_NAME`
           AND col.`COLUMN_NAME` = ke.`COLUMN_NAME`

-- chosen database
WHERE tab.`TABLE_SCHEMA` = 'dev_life'
      -- exclude JHipster own tables
      AND tab.`TABLE_NAME` NOT LIKE 'jhi\_%'
      -- exclude liquibase tables
      AND ke.`TABLE_NAME` NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- exclude views and alike
      AND TABLE_TYPE LIKE 'BASE TABLE'
      -- exclude foreign keys, this automatically exclude junction tables
      AND ke.`REFERENCED_TABLE_NAME` IS NULL
;
