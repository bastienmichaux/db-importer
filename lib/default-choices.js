/**
 * @file Choices without user interaction
 * It typically reproduces the behavior the program would have if you only selected default values at each choice
 */

/**
 * copy the query result under session.entities
 * it means we exclude jhipster, liquibase and manyToMany tables
 *
 * @param {{results: {tables, jhipster, liquibase, manyToManyTablesOnly}}} session
 */
const entities = session => Object.assign({ entities: session.results.tables }, session);

/**
 * copy the manyToManyJunctions query result under session.manyToMany
 *
 * @param {{manyToMany}} session
 */
const manyToMany = session => Object.assign({ manyToMany: session.results.manyToManyJunctions }, session);

/**
 * Exclude foreign keys from queried columns, format them and store them under session.fields.
 *
 * @param {{ results: { columnsByTable:{ tableName, columns: [{ columnName, columnType }] } } }} session the queried columns
 * @returns {{ fields:[{ tableName, columnName, columnType }] }} formatted and selected columns under fields key
 */
const columns = (session) => {
    const { columnsByTable } = session.results;

    let columns = [];

    columnsByTable.forEach((table) => {
        const columnsOfOneTable = table.columns.map(column => ({
            tableName: table.tableName,
            columnName: column.name,
            columnType: column.type
        }));

        columns = columns.concat(columnsOfOneTable);
    });

    return Object.assign({ fields: columns }, session);
};

module.exports = {
    entities,
    manyToMany,
    columns
};
