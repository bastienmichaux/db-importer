# node-db-importer

This module produces JSON files from a database. You can then use these files for other applications like [JHipster](www.jhipster.github.io).

**Note:** This module is a prototype, it doesn't do much at the moment. However it is easy to contribute to the project, just keep reading this document.

When completed, this module will :

* Connect to a SQL database
* Get a description of the database (using `SHOW COLUMNS`, `DESCRIBE`, `EXPLAIN`, etc.)
* Get a SQL dump of the table entries (if you need it)
* Convert both to JSON, according to your preferences

## Install and start

**Use it into your project:** Add this line to your `package.json` dependencies :

`"node-db-importer":"^0.0.1"`

Then run `$ npm install`.

For a global installation :

`$ npm install -g node-db-importer`

Then start the tool with :

`$ node index`

### Requisites

Node latest stable release (v6.8 at least). [Upgrade Node](https://stackoverflow.com/questions/10075990/upgrading-node-js-to-latest-version) if necessary.

## Contributing

Check our [doc](doc) for more info.

**Workflow**: Your contributions are welcome. Create a Github issue to discuss enhancements, new features, etc. Please make pull requests to the `dev` branch.

**Testing**: All tests must pass. We use **Mocha** and **Istanbul** for unit testing, and **Travis** for integration testing.

`$ npm test`

**Linting**: Linting enforces code conventions. We use **eslint** with the AirBnB ruleset + custom rules. Before making a pull request, please lint your branch with :

```bash
# lint a file
$ eslint myfile

# lint all files (when you're in the module's root)
$ eslint .
```

If you need it, you can tell eslint to [ignore some rules](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments).

## Help

**MySQL :** if you have trouble connecting to a local MySQL database, try leaving the 'Host address' field blank.

## Contact

Create a github issue to discuss the module.

For private messages : bmichaux@altissia.org

## License

[ISC](http://www.isc.org/downloads/software-support-policy/isc-license/)

## Thanks

[fhemberger](https://github.com/fhemberger), [Joshua Austill](https://jlaustill.github.io), [Notso](https://gitter.im/notsonotso), [WORMSS](http://wormss.net)
