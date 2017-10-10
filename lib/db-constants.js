/**
 * @file Constants
 */

/**
 * Categories for the retrieved tables
 * @enum {string}
 */
const FIELDS = {
    jhipster: 'jhipster',
    liquibase: 'liquibase',
    manyToManyTablesOnly: 'manyToManyTablesOnly',
    tables: 'tables'
};

/**
 * Known errors the program can recover from
 * @enum {string}
 */
const DB_ERRORS = {
    HOST_UNREACH: 'HOST_UNREACH',
    ACCESS_DENIED: 'ACCESS_DENIED',
    UNHANDLED: 'UNHANDLED_DB_CONNECTION_ERROR'
};

const MYSQL_ERROR_DICTIONARY = {
    EHOSTUNREACH: DB_ERRORS.HOST_UNREACH,
    ER_ACCESS_DENIED_ERROR: DB_ERRORS.ACCESS_DENIED,
};

const ERROR_DICTIONARIES = {
    mysql: MYSQL_ERROR_DICTIONARY
};

module.exports = {
    FIELDS,
    DB_ERRORS,
    ERROR_DICTIONARIES,
};
