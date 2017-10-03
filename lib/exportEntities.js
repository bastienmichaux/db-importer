const fse = require('fs-extra');
const cst = require('../constants');

const exportEntities = entities => fse.writeJson(cst.exportFile, entities, { spaces: 4 });

module.exports = {
    exportEntities
};
