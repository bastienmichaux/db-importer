/**
 * @file MYSQL constants
 */


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


module.exports = {
    metaDatabase,
    fields
};
