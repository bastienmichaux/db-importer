const db = require('./lib/db-constants');

/**
 * Deduce which information provoked the error and set questions to replace such information
 *
 * @param {Error} error to handle
 * @returns {{dbms, host, port, user, password, schema}} the repaired but incomplete credentials
 * @throws {Error} if not able to handle the error itself
 */
const handleConnectionError = (error) => {
    switch (error.commonCode) {
    case db.DB_ERRORS.ACCESS_DENIED:
        delete error.brokenSession.user;
        delete error.brokenSession.password;
        break;
    case db.DB_ERRORS.HOST_UNREACH:
        delete error.brokenSession.host;
        break;
    default:
        throw error;
    }

    return error.brokenSession;
};

module.exports = {
    handleConnectionError
};
