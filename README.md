# node-db-importer
[![NPM version][npm-image]][npm-url]
[![David][david-image]][david-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

This module extracts the structure of a database, transforms it into JHipster entities and their dbh counterparts 
and produces JSON files with it.

These files are meant to be used with [JHipster](www.jhipster.github.io) and / or [db-helper](https://github.com/bastienmichaux/generator-jhipster-db-helper).

**Note:** This module is a prototype, it doesn't do much at the moment. However it is easy to contribute to the project, just keep reading this document.

At the moment, this module :
* supports mysql
* can extract the table structure and let you select which table you want

## Install and start

It doesn't integrate with JHipster or DB-Helper yet, so you must use it as a standalone module :

`yarn add node-db-importer`

And you can use it as any other module or run it alone :

`$ node node_module/node-db-importer/index`

### Prerequisites

- The database you want to import must be running :
    - mysql : You need reading access to `information_schema` table
- Node latest stable release (v6.8 at least). [Upgrade Node](https://stackoverflow.com/questions/10075990/upgrading-node-js-to-latest-version) if necessary.

## Usage

The module will ask you needed information and output the files into two directories : `.jhipster` and `.dbh`.

### credentials

You may answer to the module prompts or provide a configuration file named **.db-config.json**.
The configuration file must have the following format : 
```json
{
    "dbms": "mysql",
    "host": "10.10.10.10",
    "user": "root",
    "port": "3306",
    "password": "password",
    "schema": "databaseIWantToImport"
}
```
All fields from the configuration file will be ran against validation, a warning will be printed if it doesn't pass
and you'll be offered to give a new value.

**No particular precaution has been taken concerning the password, store it at your own risk.**

### entities

It will classify found tables into four categories :
1. tables : any table which doesn't fit the following categories, **checked by default**
1. twoTypeJunction : tables used as a junction table between two other tables,
you most probably want to let the module to create a many-to-many relationship with it.
1. jhipster: jhipster own tables, depending the customisation of your project you want them or not.
1. liquibase: liquibase tables, you most probably don't want anything to do with it.

The tables you check will be used to create entities and won't be available to create many-to-many relationships. 

## Contributing

Check our [doc](doc) for more info.

**Workflow**: Your contributions are welcome. Create a Github issue to discuss enhancements, new features, etc. Please make pull requests to the `dev` branch.

**Testing**: All tests must pass. We use **Mocha** and **Istanbul (nyc)** for unit testing, and **Travis** for integration testing.

`$ npm test`

**Linting**: Linting enforces code conventions. We use **eslint** with the AirBnB ruleset extended with custom rules.
Travis tests linting and will fail the build with there is any linting error (warning are accepted).

## Contact

You are welcome to discuss the module in [db-helper's gitter](https://gitter.im/generator-jhipster-db-helper/Lobby).requiredrequiredrequired

For private messages : bmichaux@altissia.com

## License

[ISC](http://www.isc.org/downloads/software-support-policy/isc-license/)

## Thanks

[fhemberger](https://github.com/fhemberger), [Joshua Austill](https://jlaustill.github.io), [Notso](https://gitter.im/notsonotso), [WORMSS](http://wormss.net)

[npm-image]: https://img.shields.io/npm/v/node-db-importer.svg
[npm-url]: https://www.npmjs.com/package/node-db-importer
[david-image]: https://david-dm.org/bastienmichaux/db-importer.svg?theme=shields.io
[david-url]: https://david-dm.org/bastienmichaux/db-importer
[travis-image]: https://travis-ci.org/bastienmichaux/db-importer.svg?branch=master
[travis-url]: https://travis-ci.org/bastienmichaux/db-importer
[coveralls-image]: https://coveralls.io/repos/github/bastienmichaux/db-importer/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/bastienmichaux/db-importer?branch=master
