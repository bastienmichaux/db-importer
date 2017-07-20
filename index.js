// dbi library
const ask = require('inquirer').prompt;
const cst = require('./constants');

const inquiries = cst.inquiries;
const msg = cst.messages;


const start = () => {
    console.log(msg.greeting);

    ask(inquiries.dbms).then((answer) => {
        console.log(`You chose ${answer.dbms}`);
    });
};

start();
