const entities = session => Object.assign({ entities: session.results.tables }, session);

const columns = (session) => {
    // @todo your code here
    return session;
};

module.exports = {
    entities,
    columns
};
