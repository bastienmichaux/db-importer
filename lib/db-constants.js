/**
 * @file Constants
 */

/**
 * Categories for the retrieved tables
 * @enum {string}
 */
const fields = {
    jhipster: 'jhipster',
    liquibase: 'liquibase',
    twoTypeJunction: 'twoTypeJunction',
    tables: 'tables'
};

/**
 * Messages displayed to the user
 * @enum {string}
 */
const messages = {
    connectionSuccess: 'connected to the database',
    connectionFailure: 'failed to connect to the database'
};

module.exports = {
    fields,
    messages
};
