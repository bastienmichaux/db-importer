const chalk = require('chalk');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const lodash = require('lodash');

const cst = require('./constants');

const inquiries = cst.inquiries;

const emphasize = (msg) => {
    /* istanbul ignore next */
    console.log(chalk.bold(msg));
};

const info = (msg) => {
    /* istanbul ignore next */
    console.log(chalk.hex('#00f2ff')(msg));
};

const success = (msg) => {
    /* istanbul ignore next */
    console.log(chalk.hex('#06F90B')(msg));
};

const failure = (msg) => {
    /* istanbul ignore next */
    console.error(chalk.hex('#F9060B')(msg));
};

const warning = (msg) => {
    /* istanbul ignore next */
    console.warn(chalk.hex('#f7ff00')(msg));
};

/**
 * create configuration with configuration file's values if present
 * make related prompts to be skipped
 *
 * @resolves configuration object
 */
const init = () => fse.readJson(cst.configFile)
    .then((config) => {
        // disable prompts if for items specified by the configuration file
        lodash.forEach(config, (value, key) => {
            if (inquiries[key]) {
                /**
                 * validate returns true or the error message and a non empty string is considered truthy
                 * I am so sorry, I have no other choice than to compare to true
                 */
                if (typeof (inquiries[key].validate) === 'function' && inquiries[key].validate(config[key]) !== true) {
                    warning(`${cst.configFile} "${key}": "${value}" ${inquiries[key].validate(config[key])}`);
                } else {
                    inquiries[key].when = false; // means the question is skipped
                }
            } else {
                warning(`${key} is defined in ${cst.configFile} but is not a valid configuration item`);
            }
        });
        lodash.forEach(inquiries, (prompt) => {
            if (typeof (prompt.default) === 'function') {
                /**
                 * inquirer won't have access to the configuration file, we must thus manually run the default functions
                 */
                if (prompt.default(config)) prompt.default = prompt.default(config);
            }
        });
        info(`${cst.configFile} has been loaded`);
        return config;
    })
    .catch((error) => {
        failure(error);
        return {}; // if an error occurs, loads nothing.
    });

const askCredentials = () => inquirer.prompt([
    inquiries.dbms,
    inquiries.host,
    inquiries.port,
    inquiries.user,
    inquiries.password,
    inquiries.schema
]);

module.exports = {
    emphasize,
    info,
    success,
    failure,
    warning,
    init,
    askCredentials
};
