// dbi library
const cst = require('./constants');
const prompt = require('./prompt');
const log = require('./lib/log');
const db = require('./lib/db-commons');

const msg = cst.messages;

log.emphasize(msg.greeting);

prompt.init()
    .then(prompt.askCredentials)
    .then(db.connect)
    .then(db.entityCandidates)
    .then(prompt.selectEntities)
    .then(db.close, (error) => {
        console.log(error);
        return prompt.askCredentials().then(db.connect).then(db.close);
    });
