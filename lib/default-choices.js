/**
 * @file Choices without user interaction
 */

/**
 * takes the results from the database and set the 'tables' category as entities
 *
 * @param {{results: {tables, jhipster, liquibase, twoTypeJunctions}}} session
 */
const entities = session => Object.assign({ entities: session.results.tables }, session);

module.exports = {
    entities
};
