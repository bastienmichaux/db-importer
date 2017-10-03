/**
 * @file Export results to actual files
 */

const fse = require('fs-extra');
const cst = require('../constants');

/**
 * Take the entities object and create a Json file from it
 *
 * @param {{}} entities object representing the entities we want to create
 */
const exportEntities = entities => fse.writeJson(cst.exportFile, entities, { spaces: 4 });

module.exports = {
    exportEntities
};
