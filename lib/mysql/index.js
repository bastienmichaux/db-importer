/**
 * @file Core functions for connection and processing of data
 * retrieved from a MYSQL server
 *
 * We promisify some mysql methods in order to be able to wait for their execution
 * and handle any error thrown.
 * If we don't, we can't catch the errors before doing further operations.
 *
 * We need to do it manually because mysqljs doesn't respect node conventions:
 * the callback is always called, with an error of null or undefined value in case of success.
 */

const lodash = require('lodash');
const mysql = require('mysql');
const voca = require('voca'); // string manipulation library

const cst = require('./constants');
const db = require('../db-constants');
const javaTypes = require('../jhipster-constants').jhipsterJavaTypes;
const log = require('../log');
const queries = require('./queries');

/**
 * Open a mysql connection, in a promisified way.
 *
 * @param {Object} session - Object containing the necessary fields to connect to a database : {dbms, host, port, user, password}
 * @returns {Promise} Whether or not the connection to the MYSQL server succeeded
 */
const connect = (session) => {
    // the connection credentials + the SQL query (escaped)
    session.connection = mysql.createConnection({
        host: session.host,
        port: session.port,
        user: session.user,
        password: session.password,
        database: cst.metaDatabase
    });

    return new Promise((resolve, reject) => {
        session.connection.connect((error) => {
            if (error) {
                error.brokenSession = session;
                return reject(error);
            }
            return resolve();
        });
    });
};


/**
 * Close a mysql connection, in a promisified way
 *
 * @param session - The current client's MYSQL session
 * @returns {Promise} Whether or not the connection closed
 */
const close = session => new Promise((resolve, reject) => {
    session.end((error) => {
        if (error) {
            return reject(error);
        }
        return resolve();
    });
});


/**
 * From a connection to a mysql database,
 * return tables as a list
 *
 * @param session - The current client's MYSQL session
 * @returns {Promise}
 */
const entityCandidates = (session) => {
    /**
     * promisified version of session.query
     *
     * @param store - the session.results property it will use to store results.
     * @param query - the query it must run
     * @returns {Promise}
     */
    const promisedQuery = (store, query) => new Promise((resolve, reject) => {
        // pass the SQL query
        session.connection.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
            // store results as an array of strings
            session.results[store] = lodash.map(results, cst.fields.tableName);
            return resolve();
        });
    });

    const schema = mysql.escape(session.schema);
    const jhipsterQuery = queries.jhipster(schema);
    const liquibaseQuery = queries.liquibase(schema);

    return promisedQuery(db.FIELDS.jhipster, jhipsterQuery)
        .then(() => promisedQuery(db.FIELDS.liquibase, liquibaseQuery))
        .then(() => {
            // filter tables we don't want to query
            const filter = mysql.escape(lodash.flatten(lodash.values(session.results)));
            const twoTypeJunctionQuery = queries.twoTypeJunction(schema, filter);

            return promisedQuery(db.FIELDS.twoTypeJunction, twoTypeJunctionQuery);
        })
        .then(() => {
            // filter tables we don't want to query
            const filter = mysql.escape(lodash.flatten(lodash.values(session.results)));
            const tablesQuery = queries.tables(schema, filter);

            return promisedQuery(db.FIELDS.tables, tablesQuery);
        });
};


/**
 * Use the raw query results of mysqljs to create an object representing the database structure.
 * This function returns an object with as many properties as there are tables.
 * Each table is an array of objects, each one of these objects represents a column.
 *
 * @param { Object[] } queryResults - an array of RowDataPacket objects, the output of queries.allColumns (see .entityCandidatesColumns)
 * @returns { Object } the returned object has this structure : { tableName: { columnName: { column properties } } }
 */
const organizeColumns = (queryResults) => {
    const result = {};

    // modify this loop to add more column values
    queryResults.forEach((queryResult) => {
        const tableName = queryResult.table_name;
        const columnName = queryResult.column_name;

        const columnProperties = {
            tableName: queryResult.table_name,
            columnName: queryResult.column_name,
            ordinalPosition: queryResult.ordinal_position,
            columnDefault: queryResult.column_default,
            isNullable: queryResult.is_nullable,
            dataType: queryResult.data_type,
            characterMaximumLength: queryResult.character_maximum_length,
            characterOctetLength: queryResult.character_octet_length,
            numericPrecision: queryResult.numeric_precision,
            numericScale: queryResult.numeric_scale,
            datetimePrecision: queryResult.datetime_precision,
            characterSetName: queryResult.character_set_name,
            collationName: queryResult.collation_name,
            columnType: queryResult.column_type,
            columnComment: queryResult.column_comment
        };

        // initialise result.tableName if it doesn't exist yet
        result[tableName] = result[tableName] || {};

        result[tableName][columnName] = columnProperties;
    });

    return result;
};


/**
 * Return true if the MySQL type can be mapped to a Java Boolean type
 * We consider that only the column_type 'tinyint(1)' is meant as a boolean by developers
 * @todo: handle overriding of the default mapping by the configuration file
 * @param columnType
 * @returns {boolean}
 */
const isBooleanType = mysqlType => (mysqlType === 'tinyint(1)');


const isDateType = mysqlType => cst.dateTypes.includes(mysqlType);


const isIntegerType = mysqlType => cst.integerTypes.includes(mysqlType);


const isFloatingPointType = mysqlType => cst.floatingPointTypes.includes(mysqlType);


const isJsonType = mysqlType => cst.jsonType === mysqlType;


const isSpatialType = mysqlType => cst.spatialTypes.includes(mysqlType);


const isStringType = mysqlType => cst.stringTypes.includes(mysqlType);


const isBinaryType = mysqlType => cst.binaryTypes.includes(mysqlType);

/**
 * Choose the appropriate Java integer type for the input MySQL date type
 */
const mapIntegerType = () => javaTypes.Long;

/**
 * Choose the appropriate Java floating-point type for the input MySQL date type
 */
const mapFloatingPointType = () => javaTypes.Double;

/**
 * Choose the appropriate Java date type for the input MySQL date type
 */
const mapDateType = () => javaTypes.LocalDate;

/**
 * map a MySQL type to a Java type/class supported by Jhipster
 * @todo: what value should be returned for types that are not supported by Jhipster ?
 * @param data_type: the value of INFORMATION_SCHEMA.COLUMNS.DATA_TYPE
 * @param column_type: idem
 */
const jhipsterFieldType = (columnProperties) => {
    const dataType = columnProperties.dataType;
    // console.log(`Type of ${columnProperties.tableName}.${columnProperties.columnName} is ${columnProperties.dataType}`);
    let fieldType = null;

    if (isJsonType(dataType)) {
        log.info(`Type of ${columnProperties.tableName}.${columnProperties.columnName} is JSON. We do not handle the JSON type at the moment.`);
    } else if (isBooleanType(dataType)) {
        fieldType = javaTypes.Boolean;
    } else if (isDateType(dataType)) {
        fieldType = mapDateType();
    } else if (isIntegerType(dataType)) {
        fieldType = mapIntegerType();
    } else if (isFloatingPointType(dataType)) {
        fieldType = mapFloatingPointType();
    } else if (isStringType(dataType)) {
        fieldType = javaTypes.String;
    } else if (isBinaryType(dataType)) {
        fieldType = javaTypes.byte;
    } else if (isSpatialType(dataType)) {
        log.warning(`Type of ${columnProperties.tableName}.${columnProperties.columnName} is a spatial type. We do not handle these types at the moment.`);
    } else {
        log.warning(`Type of ${columnProperties.tableName}.${columnProperties.columnName} ('${dataType}') is not a MySQL type we know about.`);
    }

    return fieldType;
};


/**
 * get the 'fields' property of a jhipster entity
 */
const jhipsterFields = (entity) => {
    const columns = Object.keys(entity);
    const fields = [];

    columns.forEach((column) => {
        const field = {};
        field.fieldName = entity[column].columnName;
        field.fieldType = jhipsterFieldType(entity[column]);
        fields.push(field);
    });

    return fields;
};


/**
 * get the 'relationships' property of a jhipster entity
 */
const jhipsterRelationships = (entity) => {
    const relationships = [];
    const relationship = {};
    return relationships;
};


/**
 * map mysql data to a Jhipster entity ready to be written to a json file
 */
const jhipsterEntity = (tableName, entity) => ({
    entityTableName: tableName,
    fields: jhipsterFields(entity),
    relationships: jhipsterRelationships(entity)
});


/**
 * map each mysql table to a Jhipster entity, the returned object is json data ready for file creation
 */
const jhipsterEntities = (entities) => {
    const jhipsterEntities = {};
    const tables = Object.keys(entities);
    let jhipsterEntityName = null;

    tables.forEach((tableName) => {
        // for table 'foo', create an object Foo: { jhipster entity ... }
        jhipsterEntityName = voca.capitalize(tableName);
        jhipsterEntities[jhipsterEntityName] = jhipsterEntity(tableName, entities[tableName]);
    });

    return jhipsterEntities;
};


/**
 * Pass a query to get the data needed for mapping the columns,
 * then organize the data (organizeColumns) and update the session.entities object with them.
 *
 * @param {Object} session - the current user session
 */
const entityCandidatesColumns = (session) => {
    const promisedQuery = query => new Promise((resolve, reject) => {
        const tables = session.entities;

        // pass the SQL query        
        session.connection.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }

            // update the session entities
            session.entities = organizeColumns(results);
            return resolve(session);
        });
    });

    const schema = mysql.escape(session.schema);
    const tables = mysql.escape(session.entities);
    const columnsSelectionQuery = queries.allColumns(schema, tables);

    return promisedQuery(columnsSelectionQuery);
};


module.exports = {
    connect,
    close,
    entityCandidates,
    entityCandidatesColumns,
    jhipsterEntities,
    jhipsterFields,
    jhipsterRelationships,
    organizeColumns
};
