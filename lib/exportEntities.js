const fse = require('fs-extra');
const cst = require('../constants');

const exportEntities = entities => fse.writeJson(cst.exportFile, entities, { spaces: 2 });

module.exports = {
    exportEntities
};
