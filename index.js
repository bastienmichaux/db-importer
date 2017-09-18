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


/**
 * Ask the user for credentials,
 * then what database should be imported
 */
prompt.init()
    // get connection credentials from the user & validate them
    // returns session credentials
    .then(configuration => prompt.askCredentials(configuration))
    .catch(err => db.sessionErrorHandler(err, 'prompt.init'))

    // attempt connection to the database using the session credentials
    .then(credentials => db.connect(credentials))
    .catch(err => db.sessionErrorHandler(err, 'prompt.askCredentials'))

    // display retrieved tables
    .then(session => db.entityCandidates(session))
    .catch(err => db.sessionErrorHandler(err, 'db.connect'))

    // ask the user what tables should be converted to JSON entities
    .then(session => prompt.selectEntities(session))
    .catch(err => db.sessionErrorHandler(err, 'prompt.entityCandidates'))

    // create JSON files for the selected entities
    .then(session => db.createEntities(session))
    .catch(err => db.sessionErrorHandler(err, 'prompt.selectEntities'))

    // close the connection, in case of error try again
    .then(session => db.close(session))
    .catch(err => db.sessionErrorHandler(err, 'prompt.createEntities'));
