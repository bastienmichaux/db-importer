const assert = require('assert');
const sinon = require('sinon');
const sqlstring = require('sqlstring');

const queries = require('../lib/mysql/queries');


const expectedColumnsQuery = `
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

-- chosen schema
WHERE tab.TABLE_SCHEMA = 'elearning'
      -- exclude JHipster own tables
      AND tab.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- exclude views and alike
      AND TABLE_TYPE LIKE 'BASE TABLE'
      -- exclude foreign keys, this automatically exclude junction tables
      AND ke.REFERENCED_TABLE_NAME IS NULL
;`;

const expectedManyToManyQuery = `
SELECT
    ke.TABLE_NAME AS 'JUNCTION_TABLE',
    GROUP_CONCAT(ke.COLUMN_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'FOREIGN_KEYS',
    GROUP_CONCAT(ke.REFERENCED_TABLE_NAME ORDER BY ke.REFERENCED_TABLE_NAME ASC) AS 'REFERENCED_TABLES'
FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = 'elearning'
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
;`;

const expectedManyToOneQuery = `
SELECT
    ke.TABLE_NAME as 'TABLE_FROM',
    ke.COLUMN_NAME as 'COL_FROM',
    ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

    LEFT JOIN COLUMNS col
        ON col.TABLE_NAME = ke.TABLE_NAME
           AND col.COLUMN_NAME = ke.COLUMN_NAME
           AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = 'elearning'
      AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alikes
      AND ke.REFERENCED_TABLE_NAME IS NOT NULL
      -- only many-to-many relationships
      AND col.COLUMN_KEY = 'MUL'
;`;

const expectedOneToOneQuery = `
SELECT
  ke.TABLE_NAME as 'TABLE_FROM',
  ke.COLUMN_NAME as 'COL_FROM',
  ke.REFERENCED_TABLE_NAME as 'TABLE_TO'

FROM KEY_COLUMN_USAGE ke

  LEFT JOIN COLUMNS col
    ON col.TABLE_NAME = ke.TABLE_NAME
       AND col.COLUMN_NAME = ke.COLUMN_NAME
       AND col.TABLE_SCHEMA = ke.TABLE_SCHEMA

WHERE ke.REFERENCED_TABLE_SCHEMA = 'elearning'
      AND ke.TABLE_NAME NOT LIKE 'jhi\\_%'
      -- exclude liquibase tables
      AND ke.TABLE_NAME NOT IN ('DATABASECHANGELOG', 'DATABASECHANGELOGLOCK')
      -- only relationship constraints, this excludes indexes and alikes
      AND ke.REFERENCED_TABLE_NAME IS NOT NULL
      -- only many-to-many relationships
      AND col.COLUMN_KEY = 'UNI'
;`;

describe('./lib/mysql/queries.js', function () {
    const connection = {
        escape: sqlstring.escape
    };

    beforeEach(function () {
        sinon.spy(connection, 'escape');
    });

    afterEach(function () {
        connection.escape.restore();
    });

    // -- assert columns === template query
    it('columns returns expected query with good parameter', function () {
        const actualColumnsQuery = queries.columns('elearning', connection);

        sinon.assert.calledOnce(connection.escape);
        sinon.assert.alwaysCalledWith(connection.escape, 'elearning');

        assert.equal(actualColumnsQuery, expectedColumnsQuery);
    });

    // -- assert many-to-many === template query
    it('many-to-many returns expected query with good parameter', function () {
        const actualManyToManyQuery = queries.manyToMany('elearning', connection);

        sinon.assert.calledOnce(connection.escape);
        sinon.assert.alwaysCalledWith(connection.escape, 'elearning');

        assert.equal(actualManyToManyQuery, expectedManyToManyQuery);
    });

    // -- assert many-to-one === template query
    it('many-to-one returns expected query with good parameter', function () {
        const actualManyToOneQuery = queries.manyToOne('elearning', connection);

        sinon.assert.calledOnce(connection.escape);
        sinon.assert.alwaysCalledWith(connection.escape, 'elearning');

        assert.equal(actualManyToOneQuery, expectedManyToOneQuery);
    });

    // -- assert one-to-one === template query
    it('one-to-one returns expected query with good parameter', function () {
        const actualOneToOneQuery = queries.oneToOne('elearning', connection);

        sinon.assert.calledOnce(connection.escape);
        sinon.assert.alwaysCalledWith(connection.escape, 'elearning');

        assert.equal(actualOneToOneQuery, expectedOneToOneQuery);
    });
});
