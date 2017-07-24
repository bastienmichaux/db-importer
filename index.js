// dbi library
const ask = require('inquirer').prompt;
const cst = require('./constants');

const inquiries = cst.inquiries;
const msg = cst.messages;


const askCredentials = () => {
    console.log(msg.greeting);

    const credentials = {};

    ask(inquiries.dbms)
        .then((onFulfilled) => {
            credentials.dbms = onFulfilled.dbms;

            // todo : move the switch block in a separate method
            switch (onFulfilled.dbms) {
            case cst.dbmsList.mysql:
                inquiries.port.default = cst.dbmsDefaultPorts.mysql;
                break;

            default:
                // There is not default
            }

            // todo add validation for the host and port
            return ask([inquiries.host, inquiries.port, inquiries.user, inquiries.password, inquiries.schema]);
        })
        // todo directly add dbms with previous return statement (see promises)
        .then(onFulfilled => Object.assign(credentials, onFulfilled))
        .then(connect); // eslint-disable-line  no-use-before-define
};

const connect = (onFulFilled) => {
    console.log(onFulFilled);
};

askCredentials();
