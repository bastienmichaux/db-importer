// dbi library
const cst = require('./constants');
const prompt = require('./prompt');

const msg = cst.messages;


const askCredentials = () => {
    console.log(msg.greeting);

    prompt.askCredentials()
        .then(connect); // eslint-disable-line  no-use-before-define
};

const connect = (onFulFilled) => {
    console.log(onFulFilled);
};

askCredentials();
