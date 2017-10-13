/**
 * @file Export results to actual files
 */

const fse = require('fs-extra');
const cst = require('../constants');

/**
 * Take the entities object and create a Json file from it
 *
 * @param {{entities, fields, manyToMany}} session object containing data to export
 */
const exportEntities = (session) => {
    const exportMe = {
        entities: [],
        manyToMany: [],
    };

    const entitiesObj = {};

    session.entities.forEach((entity) => {
        entitiesObj[entity] = {
            entityName: entity,
            fields: [],
        };
    });

    session.fields.forEach((field) => {
        const entity = entitiesObj[field.tableName];
        const newField = {
            fieldName: field.columnName,
            fieldType: field.columnType
        };
        entity.fields.push(newField);
    });

    // transform object into array
    exportMe.entities = Object.keys(entitiesObj).map(key => entitiesObj[key]);

    exportMe.manyToMany = session.manyToMany;

    return fse.writeJson(cst.exportFile, exportMe, { spaces: 4 });
};

module.exports = {
    exportEntities
};
