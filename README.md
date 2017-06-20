# node-db-importer

This module produces JSON files from a database. You can then use these files to setup projects like [JHipster](www.jhipster.github.io).

*(This module is still a prototype, it doesn't do anything at the moment.)*

When completed, this module will :

* Connect to a SQL database
* Get a description of the database (using `SHOW COLUMNS`, `DESCRIBE`, `EXPLAIN`, etc.)
* Get a SQL dump of the table entries (if you need it)
* Convert both to JSON, according to your preferences

## Install

Global install :

`$ npm install -g node-db-importer`

Local install :

`$ npm install node-db-importer`

### Requisites

Node latest stable release (v6.8 at least). [Upgrade Node](https://stackoverflow.com/questions/10075990/upgrading-node-js-to-latest-version) if necessary.

## Start

*(to do)*

## Contributing

Check our [doc](doc) for more info.

This module is test-driven. As long as your commits include unit tests, it should work fine !

**Workflow**: we merge all new commits into our **dev** branch, and if the build passes we merge the dev branch into **master**. Unless your commit is trivial (typos, etc), don't push to master.

**Testing**: All tests must pass. We use **Mocha** and **Istanbul** for unit testing, and **Travis** for integration testing.

```bash
npm test
```

**Linting**: We use **eslint** with the AirBnB ruleset + custom rules. Please lint your branch before making a pull request.

```bash
# lint a file
eslint myfile

# lint all files (when you're in the module's root)
eslint .
```

You can ignore some cumbersome rules by inserting into your code [eslint-disable](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments).

## Contact

Send me a private message : **@bastienmichaux** on [Gitter](https://gitter.im).

## License

[ISC](http://www.isc.org/downloads/software-support-policy/isc-license/)

## Thanks

[fhemberger](https://github.com/fhemberger), [Joshua Austill](https://jlaustill.github.io), [Notso](https://gitter.im/notsonotso) [WORMSS](http://wormss.net)
