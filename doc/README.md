# Documentation

This documentation is intended for contributors.

## Project outline

An outline of the program's flow is available [here](outline.yaml).

## Roadmap

* end of June 2017 : schema importation for MySQL, test suite
* end of July 2017 : schema importation for other SQL databases
* end of August 2017 : values importation (it's a *"nice to have"* actually)

**Note** : Knex v0.14 should be released around august and will have backwards incompatible changes (Mikael Lepistö on Gitter).

## Project info

### Databases

We support first MySQL. We aim to support all SQL databases supported by JHipster.

* MariaDB
* MS SQL
* MySQL
* Oracle
* PostgreSQL
* SQLite

### Interesting node modules

We may have to try several solutions. [knex](http://knexjs.org/) integrates all sql databases suported by JHipster.

Or we can integrate these packages ourselves.

* pg
* sqlite3
* mysql
* mysql2
* mariasql
* strong-oracle
* oracle
* mssql

**Sql validation:** we could use this module for sql validation: [mysql-validator](https://www.npmjs.com/package/mysql-validator).

Local, command-line sql validation can also be obtained through [Percona Toolkit](https://www.percona.com/software/database-tools/percona-toolkit).

### Integration with JHipster

One of the goals of this module is to produce entity files that can be integrated into [JHipster](www.jhipster.github.io), either as a classic JSON, or as their proprietary domain language JDL.

![Schema import](Schema-import.png)
