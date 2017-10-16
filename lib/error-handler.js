const cst = require('./constants');
const db = require('./db-constants');
const log = require('./log');

/**
 * Deduce which information provoked the error and set questions to replace such information
 *
 * @param {Error} error to handle
 * @returns {{dbms, host, port, user, password, schema}} the repaired but incomplete credentials
 * @throws {Error} if not able to handle the error itself
 */
const handleConnectionError = (error) => {
    const brokenSession = error.brokenSession;
    const dbms = brokenSession.dbms;

    log.failure(`${dbms}: ${error.errno} - ${error.code}`);

    // automatic mode doesn't allow to recover from errors, it must fail
    if (brokenSession.mode === cst.modes.automatic) {
        throw error;
    }

    switch (db.ERROR_DICTIONARIES[dbms][error.code]) {
    case db.DB_ERRORS.ACCESS_DENIED:
        delete brokenSession.user;
        delete brokenSession.password;
        break;
    case db.DB_ERRORS.HOST_UNREACH:
        delete brokenSession.host;
        break;
    default:
        throw error;
    }

    return brokenSession;
};

module.exports = {
    handleConnectionError
};
