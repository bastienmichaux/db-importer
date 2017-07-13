const assert = require('assert');
const sinon = require('sinon');
const sqlstring = require('sqlstring');

const queries = require('../lib/mysql/queries');

const expectedTablesQuery = `
SELECT tab.TABLE_NAME

FROM TABLES tab

WHERE TABLE_SCHEMA = 'elearning'
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

        WHERE ke.REFERENCED_TABLE_SCHEMA = 'elearning'
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
;`;

describe('./lib/mysql/queries.js', () => {
    const connection = {
        escape: sqlstring.escape
    };

    beforeEach(() => {
        sinon.spy(connection, 'escape');
    });

    afterEach(() => {
        connection.escape.restore();
    });

    // -- assert tables === template query
    it('returns expected query with good parameter', () => {
        const actualTablesQuery = queries.tables('elearning', connection);

        sinon.assert.calledTwice(connection.escape);
        sinon.assert.alwaysCalledWith(connection.escape, 'elearning');

        assert.equal(actualTablesQuery, expectedTablesQuery);
    });
});
