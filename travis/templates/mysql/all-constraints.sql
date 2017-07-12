SELECT
    ke.`CONSTRAINT_NAME` AS 'CONSTRAINTS',
    col.`COLUMN_KEY`,
    '|',
    ke.`TABLE_NAME` AS 'TABLE_FROM',
    ke.`COLUMN_NAME` AS 'COL_FROM',
    '-->',
    ke.`REFERENCED_TABLE_NAME` AS 'TABLE_TO',
    ke.`REFERENCED_COLUMN_NAME` AS 'COL_TO'

FROM information_schema.`KEY_COLUMN_USAGE` ke

    LEFT JOIN `COLUMNS` col
        ON col.`TABLE_NAME` = ke.`TABLE_NAME`
           AND col.`COLUMN_NAME` = ke.`COLUMN_NAME`

WHERE REFERENCED_TABLE_SCHEMA = 'dev_life'
      AND ke.`TABLE_NAME` NOT LIKE 'jhi\_%'
      AND REFERENCED_TABLE_NAME IS NOT NULL

ORDER BY
    ke.`TABLE_NAME`,
    ke.`COLUMN_NAME`
;
