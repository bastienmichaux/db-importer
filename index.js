// dbi library
const cst = require('./constants');
const prompt = require('./prompt');
const db = require('./lib/db-commons');

const msg = cst.messages;

prompt.emphasize(msg.greeting);

prompt.init()
    .then(config => prompt.askCredentials()
        .then(answers => Object.assign(config, answers))
    )
    .then(db.connect)
    .then(db.close, () => prompt.askCredentials().then(db.connect).then(db.close));
