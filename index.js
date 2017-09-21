/**
 * @file Entry point of the program
 *
 * Uses a chain of function, meaning each function starts the next function
 * This enables to arbitrarily jump to a any step, in case of error for example
 */

/* eslint no-use-before-define: 0 */

const cst = require('./constants');
const prompt = require('./prompt');
const log = require('./lib/log');
const db = require('./lib/db-commons');

const msg = cst.messages;

/**
 * CHAIN OF FUNCTIONS
 */

/**
 * load configuration file, validate and clean it
 *
 * @resolve {askCredentials({dbms, host, port, user, password, schema})} configuration with any property possibly missing
 */
const getConfiguration = () => prompt.loadConfigurationFile()
    .then(configuration => askCredentials(configuration));

/**
 * ask user any missing credential item and merge them with existing ones
 *
 * @param {{dbms, host, port, user, password, schema}} configuration any property of this item can be missing
 * @resolve {openSession({dbms, host, port, user, password, schema})} complete credentials plus schema to extract
 */
const askCredentials = configuration => prompt.askCredentials()
    .then(credentials => Object.assign(configuration, credentials))
    .then(credentials => openSession(credentials));

/**
 * use credentials to open a session on the database
 *
 * @param {{dbms, host, port, user, password, schema}} credentials
 * @resolve {getEntityCandidates({driver, connection, schema})} session
 */
const openSession = credentials => db.connect(credentials)
    .then(session => getEntityCandidates(session));

/**
 * query all tables defined by the schema; this excludes views and the likes
 * structure them depending their probable usage
 *
 * @param {{driver, connection, schema}} session
 * @resolve {selectEntities({driver, connection, schema, results: {tables, twoTypeJunction, jhipster, liquibase}})} session
 */
const getEntityCandidates = session => db.entityCandidates(session)
    .then(session => selectEntities(session));

/**
 * ask user which table should be used to create entities
 *
 * @param {{driver, connection, schema, results: {tables, twoTypeJunction, jhipster, liquibase}}} session
 * @resolve {closeSession({driver, connection, schema, results: {entities}})} session
 */
const selectEntities = session => prompt.selectEntities(session)
    .then(session => closeSession(session));

/**
 * close session and forward results
 *
 * @param {{driver, connection, schema, results: {entities}}} session
 * @resolve {createEntities(results)}
 */
const closeSession = session => db.close(session)
    .then(session => createEntities(session.results));

/**
 * @todo WIP function, used for integration testing purpose at the moment
 *
 * @param {results} results the results of all previous steps
 */
const createEntities = results => db.createEntities(results);


/**
 * MAIN
 */

const main = () => {
    // greet the user
    log.emphasize(msg.greeting);

    getConfiguration();
};

main();
