SELECT
    ke.`TABLE_NAME` as 'TABLE_FROM',
    ke.`COLUMN_NAME` as 'COL_FROM',
    ke.`REFERENCED_TABLE_NAME` as 'TABLE_TO'

FROM `KEY_COLUMN_USAGE` ke

    LEFT JOIN `COLUMNS` col
        ON col.`TABLE_NAME` = ke.`TABLE_NAME`
           AND col.`COLUMN_NAME` = ke.`COLUMN_NAME`

WHERE ke.`REFERENCED_TABLE_SCHEMA` = 'dev_life'
      AND ke.`TABLE_NAME` NOT LIKE 'jhi\_%'
      -- exclude liquibase tables
      AND ke.`TABLE_NAME` NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alikes
      AND ke.`REFERENCED_TABLE_NAME` IS NOT NULL
      -- only many-to-many relationships
      AND col.`COLUMN_KEY` = 'MUL'
;
