// dbi library
const cst = require('./constants');
const prompt = require('./prompt');
const log = require('./lib/log');
const db = require('./lib/db-commons');

const msg = cst.messages;

log.emphasize(msg.greeting);

prompt.init()
    .then(config => prompt.askCredentials()
        .then(answers => Object.assign(config, answers))
    )
    .then(db.connect)
    .then(db.entityCandidates)
    .then(db.close, (error) => {
        console.log(error);
        return prompt.askCredentials().then(db.connect).then(db.close);
    });
