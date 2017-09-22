/**
 * @file Database-agnostic functions and constants
 */

const mysql = require('./mysql/index');


/**
 * DBMS properties
 * @enum {Object}
 */
const dbmsList = {
    mysql: {
        name: 'mysql',
        defaultPort: 3306,
        driver: mysql
    }
};


/**
 * Open the connection to the database
 *
 * @param {Object} session - Object containing the necessary fields to connect to a database : {dbms, host, port, user, password}
 * @returns {Promise} - The same session object after assigning the driver corresponding to the dbms
 * and opening a connection to the database and assigning it too.
 */
const connect = (session) => {
    session.driver = dbmsList[session.dbms].driver;

    return session.driver.connect(session)
        .then(() => {
            // return the updated session object if connection succeeds
            delete session.password;
            return session;
            // reject internal driver errors
        }, rejection => Promise.reject(rejection));
};


/**
 * Close the connection to the database
 *
 * @param {Object} session - Object containing the connection object and the driver used to open this connection
 * @returns {Promise} the same session object after closing its connection to the database
 */
const close = session => session.driver.close(session.connection, session.driver)
    .then(() => session); // todo not sure I will still need this after closing the connection


/**
 * Get the list of tables and classify them as JHipster, Liquibase, two type junctions and simple tables
 *
 * That is because depending on the type, people may not want to create entities from them.
 *
 * @param {Object} session - Object containing the connection object and the driver used to get the tables
 * @returns {Promise} The received session object with .results: {jhipster, liquibase, twoTypeJunction, tables} populated
 */
const entityCandidates = (session) => {
    session.results = {};
    return session.driver.entityCandidates(session)
        .then(() => session);
};

const createEntities = session => session.driver.createEntities(session);


module.exports = {
    dbmsList,
    connect,
    close,
    createEntities,
    entityCandidates,
};
