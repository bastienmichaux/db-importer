// dbi library
const cst = require('./constants');
const prompt = require('./prompt');
const db = require('./lib/db-commons');

const msg = cst.messages;

console.log(msg.greeting);

prompt.askCredentials()
    .then(db.connect)
    .then(db.close);
