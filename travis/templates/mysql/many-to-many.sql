SELECT
    ke.`TABLE_NAME` AS 'JUNCTION_TABLE',
    GROUP_CONCAT(ke.`COLUMN_NAME` ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'FOREIGN_KEYS',
    GROUP_CONCAT(ke.`REFERENCED_TABLE_NAME` ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'REFERENCED_TABLES'
FROM `KEY_COLUMN_USAGE` ke

    LEFT JOIN `COLUMNS` col
        ON col.`TABLE_NAME` = ke.`TABLE_NAME`
           AND col.`COLUMN_NAME` = ke.`COLUMN_NAME`

WHERE ke.`REFERENCED_TABLE_SCHEMA` = 'dev_life'
      -- exclude JHipster Tables
      AND ke.`TABLE_NAME` NOT LIKE 'jhi\_%'
      -- exclude liquibase tables
      AND ke.`TABLE_NAME` NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alike
      AND ke.`REFERENCED_TABLE_NAME` IS NOT NULL
      -- only many-to-many relationships
      AND col.`COLUMN_KEY` = 'PRI'

-- ensure we only get junction tables between two tables.
GROUP BY ke.`TABLE_NAME`
HAVING COUNT(ke.`TABLE_NAME`) = 2
;
