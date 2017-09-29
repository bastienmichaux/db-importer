/**
 * @file Entry point of the program
 *
 * Uses a chain of function, meaning each function starts the next function
 * This enables to arbitrarily jump to a any step, in case of error for example
 */

/* eslint no-use-before-define: 0 */

const cst = require('./constants');
const prompt = require('./prompt');
const err = require('./error-handler');
const log = require('./lib/log');
const db = require('./lib/db-commons');

const msg = cst.messages;

/**
 * CHAIN OF FUNCTIONS
 */

/**
 * load configuration file, validate and clean it
 *
 * @resolves {askCredentials({dbms, host, port, user, password, schema})} configuration with any property possibly missing
 */
const getConfiguration = () => prompt.loadConfigurationFile()
    .then(configuration => askCredentials(configuration));


/**
 * ask user any missing credential item and merge them with existing ones
 *
 * @param {{dbms, host, port, user, password, schema}} configuration any property of this item can be missing
 * @resolves {openSession({dbms, host, port, user, password, schema})} complete credentials plus schema to extract
 */
const askCredentials = configuration => prompt.askCredentials(configuration)
    .then(credentials => Object.assign({}, configuration, credentials))
    .then(credentials => openSession(credentials));


/**
 * use credentials to open a session on the database
 *
 * @param {{dbms, host, port, user, password, schema}} credentials
 * @resolves {getEntityCandidates({driver, connection, schema})} session
 * @throws {Error} Whatever error we don't handle ourselves
 */
const openSession = credentials => db.connect(credentials)
    .then((session) => {
        log.success(msg.connectionSuccess);
        return getEntityCandidates(session);
    }, (error) => {
        log.failure(msg.connectionFailure);
        return askCredentials(err.handleConnectionError(error));
    });


/**
 * query all tables defined by the schema; this excludes views and the likes
 * structure them depending their probable usage
 *
 * @param {{driver, connection, schema}} session
 * @resolves {selectEntities({driver, connection, schema, results: {tables, twoTypeJunction, jhipster, liquibase}})} session
 */
const getEntityCandidates = session => db.entityCandidates(session)
    .then(session => selectEntities(session)); // store all the tables of the database we're connected to into the session


/**
 * ask user which table should be used to create entities
 *
 * @param {{driver, connection, schema, results: {tables, twoTypeJunction, jhipster, liquibase}}} session
 * @resolves {closeSession({driver, connection, schema, results: {entities}})} session
 */
const selectEntities = session => prompt.selectEntities(session)
    .then(session => getEntityCandidatesColumns(session)); // retrieve the columns of the selected tables


// retrieve the columns of the selected tables
const getEntityCandidatesColumns = session => db.entityCandidatesColumns(session)
    .then(session => selectColumns(session)); // ask the user which columns should be selected


// ask the user which columns should be selected for each table
const selectColumns = session => prompt.selectColumns(session)
    .then(session => createEntities(session));


/**
 * close session and forward results
 *
 * @param {{driver, connection, schema, results: {entities}}} session
 * @resolves {createEntities(results)}
 */
const closeSession = session => db.close(session);


/**
 * @todo WIP function, used for integration testing purpose at the moment
 *
 * @param {results} results the results of all previous steps
 */
const createEntities = results => db.createEntities(results)
    .then(session => closeSession(session)); // close the connection


/**
 * MAIN
 */

const main = () => {
    // greet the user
    log.emphasize(msg.greeting);

    getConfiguration()
        .catch((error) => {
            log.failure(error.stack);
            log.emphasize(msg.contributeOnFailure);
            process.exit(1);
        });
};

main();
