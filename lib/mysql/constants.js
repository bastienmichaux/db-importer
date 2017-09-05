/**
 * @file MYSQL constants
 */

const dbiQueries = require('./queries.json');

/**
 * Name of the database that stores information about
 * all the other databases maintained by the MYSQL server.
 *
 * @constant {string}
 * @see {@link https://dev.mysql.com/doc/refman/5.7/en/information-schema.html|MYSQL doc}
 */
const metaDatabase = 'information_schema';


/**
 * Values used to map results when retrieving tables
 *
 * @enum {string}
 */
const fields = {
    tableName: 'TABLE_NAME'
};


/**
 * Queries passed to the mysql driver. Each query gets a category of tables.
 * Each category is presented separated from the other in the table list
 * when retrieving the tables from a given database schema.
 *
 * @enum {string}
 */
const queries = {
    liquibase: dbiQueries.liquibase,
    jhipster: dbiQueries.jhipster,
    twoTypeJunction: dbiQueries.twoTypeJunction,
    tables: dbiQueries.tables
};


module.exports = {
    metaDatabase,
    queries,
    fields
};
