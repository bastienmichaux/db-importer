const prompt = require('../prompt');
const cst = require('../constants');

/**
 * Open the connection to the database
 * @param session an object containing the necessary fields to connect to a database : {dbms, host, port, user, password}
 * @returns {Promise.<{}>} the same session object after assigning the driver corresponding to the dbms
 * and opening a connection to the database and assigning it too.
 */
const connect = (session) => {
    session.driver = cst.dbmsList[session.dbms].driver;

    return session.driver.connect(session)
        .then(() => {
            prompt.success(cst.messages.connectionSuccess);
            return session;
        }, () => {
            prompt.failure(cst.messages.connectionFailure); // todo failure handler should take care of prompting
            return Promise.reject(cst.messages.connectionFailure);
        });
};

/**
 * Close the connection to the database
 * @param session an object containing the connection object and the driver used to open this connection
 * @returns {Promise.<{}>} the same session object after closing its connection to the database
 */
const close = session => session.driver.close(session.connection, session.driver)
    .then(() => session); // todo not sure I will still need this after closing the connection

module.exports = {
    connect,
    close
};
