const cst = require('../constants');

const connect = (onFulfilled) => {
    onFulfilled.driver = cst.dbmsList[onFulfilled.dbms].driver;
    onFulfilled.connection = onFulfilled.driver.connect(onFulfilled);
    return onFulfilled;
};

const close = (onFulfilled) => {
    onFulfilled.driver.close(onFulfilled.driver, onFulfilled.connection);
    return onFulfilled;
};

module.exports = {
    connect,
    close
};
