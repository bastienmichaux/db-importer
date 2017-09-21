/**
 * @file Entry point of the program
 */

const cst = require('./constants');
const prompt = require('./prompt');
const log = require('./lib/log');
const db = require('./lib/db-commons');

const msg = cst.messages;

// greet the user
log.emphasize(msg.greeting);


const getCredentials = () => prompt.loadConfigurationFile()
    .then(configuration => prompt.askCredentials()
        .then(credentials => Object.assign(configuration, credentials))
    );

/**
 * Ask the user for credentials,
 * then what database should be imported
 */
getCredentials()
// attempt connection to the database using the session credentials
    .then(credentials => db.connect(credentials))

    // display retrieved tables
    .then(session => db.entityCandidates(session))

    // ask the user what tables should be converted to JSON entities
    .then(session => prompt.selectEntities(session))

    // create JSON files for the selected entities
    .then(session => db.createEntities(session))

    // close the connection, in case of error try again
    .then(session => db.close(session))
    .catch(err => db.sessionErrorHandler(err));
