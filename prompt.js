const inquirer = require('inquirer');
const cst = require('./constants');

const inquiries = cst.inquiries;

const askCredentials = () => {
    const credentials = {};

    return inquirer.prompt(inquiries.dbms);
        // .then((onFulfilled) => {
        //     credentials.dbms = onFulfilled.dbms;
        //
        //     inquiries.port.default = cst.dbmsList[credentials.dbms].defaultPort;
        //
        //     return inquirer.prompt([inquiries.host, inquiries.port, inquiries.user, inquiries.password]);
        // })
        // .then(onFulfilled => Object.assign(credentials, onFulfilled));
};

module.exports = {
    askCredentials
};
