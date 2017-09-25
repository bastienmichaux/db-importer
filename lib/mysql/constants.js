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

/**
 * Known errors the program can recover from
 * @type {{HOST_UNREACH: string, ACCESS_DENIED: string}}
 */
const DB_ERRORS = {
    HOST_UNREACH: 'EHOSTUNREACH',
    ACCESS_DENIED: 'ER_ACCESS_DENIED_ERROR',
};


module.exports = {
    DB_ERRORS,
    metaDatabase,
    fields
};
