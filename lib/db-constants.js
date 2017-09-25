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
    twoTypeJunction: 'twoTypeJunction',
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

module.exports = {
    FIELDS,
    DB_ERRORS
};
