const ask = require('inquirer').prompt;
const cst = require('./constants');

const inquiries = cst.inquiries;

const askCredentials = () => {
    const credentials = {};

    return ask(inquiries.dbms)
        .then((onFulfilled) => {
            credentials.dbms = onFulfilled.dbms;

            inquiries.port.default = cst.dbmsDefaultPorts[credentials.dbms];

            return ask([inquiries.host, inquiries.port, inquiries.user, inquiries.password, inquiries.schema]);
        })
        .then(onFulfilled => Object.assign(credentials, onFulfilled));
};

module.exports = {
    askCredentials
};
