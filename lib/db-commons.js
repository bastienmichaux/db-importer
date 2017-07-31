const cst = require('../constants');

const connect = (onFulfilled) => {
    onFulfilled.driver = cst.dbmsList[onFulfilled.dbms].driver;
    return onFulfilled.driver.connect(onFulfilled);
};

const close = (onFulfilled) => {
    onFulfilled.driver.close(onFulfilled.connection, onFulfilled.driver);
    return onFulfilled;
};

module.exports = {
    connect,
    close
};
