const cst = require('../constants');

const connect = (onFulfilled) => {
    onFulfilled.connection = cst.dbmsList[onFulfilled.dbms].handler.connect(onFulfilled);
    return onFulfilled;
};

const close = (onFulfilled) => {
    onFulfilled.connection.end((error) => {
        if (error) console.log(`error ending connection :  ${error}`);
    });
    return onFulfilled;
};

module.exports = {
    connect,
    close
};
