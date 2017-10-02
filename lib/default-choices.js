const entities = session => Object.assign({ entities: session.results.tables }, session);

module.exports = {
    entities
};
