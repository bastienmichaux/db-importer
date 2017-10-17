/**
 * @file Entry point of the program
 *
 * Uses chained functions, meaning each function calls the next function
 * This enables to arbitrarily jump to a any step, in case of an error for example
 */

/* eslint no-use-before-define: 0 */

const cst = require('./constants');
const prompt = require('./prompt');
const err = require('./error-handler');
const log = require('./lib/log');
const db = require('./lib/db-commons');
const def = require('./lib/default-choices');
const exp = require('./lib/exportEntities');

const msg = cst.messages;

/**
 * CHAINED FUNCTIONS
 */

/**
 * load configuration file, validate and clean it
 *
 * @resolves {askCredentials({dbms, host, port, user, password, schema})} configuration with any property possibly missing
 * if mode === 'automatic', skips askCredentials and go to openSession
 */
const getConfiguration = () => prompt.loadConfigurationFile()
    .then((configuration) => {
        // automatic mode doesn't askCredentials
        if (configuration.mode !== cst.modes.automatic) {
            return askCredentials(configuration);
        }
        return openSession(configuration);
    });


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
 * @resolves getEntityCandidates
 * @rejects askCredentials  - if connection failed
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
 * @resolves selectEntities or setEntities if mode is automatic
 */
const getEntityCandidates = session => db.entitiesTables(session)
    .then((session) => {
        if (session.mode === cst.modes.manual) {
            return selectEntities(session);
        }
        return setEntities(session);
    }); // store all the tables of the database we're connected to into the session


/**
 * ask user which table should be used to create entities
 *
 * @param {{driver, connection, schema, results: {tables, manyToManyTablesOnly, jhipster, liquibase}}} session
 * @resolves getManyToManyJunctions
 */
const selectEntities = session => prompt.selectEntities(session)
    .then(session => getManyToManyJunctions(session)); // retrieve the columns of the selected tables

/**
 * set which table should be used to create entities, stores the resulting array under the entities key of the received
 * object.
 * it excludes jhipster own tables, liquibase tables and junction tables (between two tables only).
 *
 * @param {{results: {tables}}} session
 * @resolves getEntityCandidatesColumns
 */
const setEntities = session => getManyToManyJunctions(def.entities(session));

/**
 * query junction tables at the condition that it wasn't previously select as an entity and that linked tables were
 * selected as entities.
 * As the purpose is to create many-to-many relationship, it only includes junction between two tables
 *
 * @param {{driver, connection, schema}} session
 * @resolves selectManyToManyJunctions or setManyToManyJunctions if mode is automatic
 */
const getManyToManyJunctions = session => db.manyToManyJunctions(session)
    .then((session) => {
        if (session.mode === cst.modes.manual) {
            return selectManyToManyJunctions(session);
        }
        return setManyToManyJunctions(session);
    });

/**
 * ask user which junction tables should be used to create many-to-many relationships
 *
 * @param {{driver, connection, schema, results: {manyToManyJunctions}}} session
 * @resolves getColumns
 */
const selectManyToManyJunctions = session => prompt.selectManyToMany(session)
    .then(session => getColumns(session));

/**
 * set which junction tables should be used to create many-to-many relationships (all of them)
 *
 * @param {{driver, connection, schema, results: {manyToManyJunctions}}} session
 * @resolves getColumns
 */
const setManyToManyJunctions = session => getColumns(def.manyToMany(session));

/**
 * query columns for the selected tables
 *
 * @param {{driver, connection, schema, entities}} session
 * @resolves selectColumns or setColumns if mode is automatic
 */
const getColumns = session => db.entitiesColumns(session)
    .then((session) => {
        if (session.mode === cst.modes.manual) {
            return selectColumns(session);
        }
        return setColumns(session);
    }); // ask the user which columns should be selected


/**
 * ask user to select which columns should be used as fields
 *
 * @param {{driver, connection, schema, results: {columnsByTable}}} session
 * @resolves closeSession
 */
const selectColumns = session => prompt.selectColumns(session)
    .then(session => closeSession(session));

/**
 * set which columns should be used as fields (non id or foreign key columns)
 *
 * @param {{driver, connection, schema, results: {columnsByTable}}} session
 * @resolves closeSession
 */
const setColumns = session => closeSession(def.columns(session));


/**
 * close session
 *
 * @param {{driver, connection, schema, results: {entities}}} session
 * @resolves exportEntities
 */
const closeSession = session => db.close(session)
    .then(session => exportEntities(session));

/**
 * format as JSON and print results from previous steps into a file
 *
 * @param {{entities, manyToManyJunctions, columns}} session
 */
const exportEntities = session => exp.exportEntities(session)
    .then(() => goodbye());

/**
 * Say goodbye to the user
 */
const goodbye = () => {
    log.emphasize(msg.goodbye);
};


/**
 * MAIN
 */

const main = () => {
    // greet the user
    log.emphasize(msg.greeting);

    // Start the chain of junctions
    getConfiguration()
        // catch any unknown error to print information about it and gracefully close the application
        .catch((error) => {
            log.failure(error.stack);
            log.emphasize(msg.contributeOnFailure);
            process.exit(1);
        });
};

main();
