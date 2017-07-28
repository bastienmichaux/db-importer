const inquirer = require('inquirer');
const cst = require('./constants');

const inquiries = cst.inquiries;


const askCredentials = () => inquirer.prompt([
    inquiries.dbms,
    inquiries.host,
    inquiries.port,
    inquiries.user,
    inquiries.password,
    inquiries.schema
]);

module.exports = {
    askCredentials
};
