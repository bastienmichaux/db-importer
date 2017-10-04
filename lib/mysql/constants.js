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

/**
 * MySQL types, used for type mapping
 * Not included: type aliases. MySQL types aliases include:
 * - dec, fixed, numeric --> decimal
 * - double precision, real --> double
 * - integer --> int
 * - bool, boolean --> tinyint(1) ; default tinyint is tinyint(4)
 *
 * Spatial types (geometry, polygon, etc.) are included but not supported
 */
const types = {
    bigint: 'bigint',
    binary: 'binary',
    bit: 'bit',
    blob: 'blob',
    char: 'char',
    date: 'date',
    datetime: 'datetime',
    decimal: 'decimal',
    double: 'double',
    enum: 'enum',
    float: 'float',
    int: 'int',
    json: 'json',
    geometry: 'geometry',
    geometrycollection: 'geometrycollection',
    linestring: 'linestring',
    longblob: 'longblob',
    longtext: 'longtext',
    mediumblob: 'mediumblob',
    mediumint: 'mediumint',
    mediumtext: 'mediumtext',
    multilinestring: 'multilinestring',
    multipoint: 'multipoint',
    multipolygon: 'multipolygon',
    point: 'point',
    polygon: 'polygon',
    set: 'set',
    smallint: 'smallint',
    text: 'text',
    time: 'time',
    timestamp: 'timestamp',
    tinyblob: 'tinyblob',
    tinyint: 'tinyint',
    tinytext: 'tinytext',
    varbinary: 'varbinary',
    varchar: 'varchar',
    year: 'year',
};


const integerTypes = [
    types.bigint,
    types.bit,
    types.int,
    types.mediumint,
    types.smallint,
    types.tinyint,
];

const floatingPointTypes = [
    types.decimal,
    types.double,
    types.float,
];

const stringTypes = [
    types.char,
    types.longtext,
    types.mediumtext,
    types.text,
    types.tinytext,
    types.varchar,
];

const binaryTypes = [
    types.blob,
    types.binary,
    types.longblob,
    types.mediumblob,
    types.tinyblob,
    types.varbinary,
];

const dateTypes = [
    types.date,
    types.datetime,
    types.time,
    types.timestamp,
    types.year,
];

const jsonType = types.json;

const spatialTypes = [
    types.geometry,
    types.geometrycollection,
    types.linestring,
    types.multilinestring,
    types.multipoint,
    types.multipolygon,
    types.point,
    types.polygon,
];


module.exports = {
    metaDatabase,
    fields,
    types,
    integerTypes,
    floatingPointTypes,
    dateTypes,
    binaryTypes,
    jsonType,
    stringTypes,
    spatialTypes
};
