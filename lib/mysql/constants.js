/**
 * @file MYSQL constants
 */


/**
 * Name of the database that stores information about
 * all the other databases maintained by the MYSQL server.
 *
 * @constant {string}
 * @see {@link https://dev.mysql.com/doc/refman/5.7/en/information-schema.html|MYSQL doc}
 */
const metaDatabase = 'information_schema';

/**
 * Values used to map results when retrieving tables
 *
 * @enum {string}
 */
const fields = {
    tableName: 'TABLE_NAME'
};


// not included: BOOL and BOOLEAN, and other type aliases (type aliases do not appear as they are declared in INFORMATION_SCHEMA
// also not included: the spatial types
const mysqlTypes = [
    'bigint', 'binary', 'bit', 'blob',
    'char',
    'date', 'datetime', 'decimal', 'double',
    'enum',
    'float',
    'int', 'integer',
    'json',
    'longblob', 'longtext',
    'mediumblob', 'mediumtext',
    'set', 'smallint',
    'text', 'time', 'timestamp', 'tinyblob', 'tinyint', 'tinytext',
    'varbinary', 'varchar',
    'year'
];


module.exports = {
    metaDatabase,
    fields,
    mysqlTypes
};
