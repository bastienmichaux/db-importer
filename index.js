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
    .then(prompt.askCredentials)
    // attempt connection to the database using the session credentials
    .then(db.connect)
    // display retrieved tables
    .then(db.entityCandidates)
    // ask the user what tables should be converted to JSON entities
    .then(prompt.selectEntities)
    // @todo convert tables to JSON entities
    // close the connection, in case of error try again
    .then(db.close, (error) => {
        log.failure(error);
        return prompt.askCredentials().then(db.connect).then(db.close);
    });
