SELECT
	ke.`TABLE_NAME` as 'TABLE_FROM',
	ke.`COLUMN_NAME` as 'COL_FROM',
	ke.`REFERENCED_TABLE_NAME` as 'TABLE_TO'

FROM `KEY_COLUMN_USAGE` ke

	LEFT JOIN `COLUMNS` col
		ON col.`TABLE_NAME` = ke.`TABLE_NAME`
			 AND col.`COLUMN_NAME` = ke.`COLUMN_NAME`

WHERE ke.`REFERENCED_TABLE_SCHEMA` = 'dev_life'
			-- exclude JHipster Tables
			AND ke.`TABLE_NAME` NOT LIKE 'jhi\_%'
			-- only relationship constraints, this excludes indexes and alikes
			AND ke.`REFERENCED_TABLE_NAME` IS NOT NULL
			-- only many-to-many relationships
			AND col.`COLUMN_KEY` = 'PRI'
      -- the following ensure we only get junction tables between two tables.
      -- that is because these are the only ones we can translate in many-to-many relationship
      -- we'd directly use this query if it would also get 'from' columns and 'target' table
			AND ke.`TABLE_NAME` IN (
				SELECT ke.`TABLE_NAME`

				FROM `KEY_COLUMN_USAGE` ke

					LEFT JOIN `COLUMNS` col
						ON col.`TABLE_NAME` = ke.`TABLE_NAME`
							 AND col.`COLUMN_NAME` = ke.`COLUMN_NAME`

				WHERE ke.`REFERENCED_TABLE_SCHEMA` = 'dev_life'
							-- exclude JHipster Tables
							AND ke.`TABLE_NAME` NOT LIKE 'jhi\_%'
							-- excludes indexes and alikes (keep relationships)
							AND ke.`REFERENCED_TABLE_NAME` IS NOT NULL
							-- only many-to-many relationships
							AND col.`COLUMN_KEY` = 'PRI'

				-- keep only junction tables between two tables
				GROUP BY ke.`TABLE_NAME`
				HAVING COUNT(ke.`TABLE_NAME`) = 2
)
;
