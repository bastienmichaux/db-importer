/*
 * this database holds a table for each mysql 5.7 type
 * goal: test conversion of all types, test type limits too (max, min, precision, etc)
 * todo: play with type attributes for types that accept parameters
 */

DROP SCHEMA IF EXISTS dbi_types;
CREATE SCHEMA dbi_types;
USE dbi_types;

DROP TABLE IF EXISTS tbl_integer;
CREATE TABLE tbl_integer
(`integer` INTEGER)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_int;
CREATE TABLE tbl_int
(`int` INT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_smallint;
CREATE TABLE tbl_smallint
(`smallint` SMALLINT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_tinyint;
CREATE TABLE tbl_tinyint
(`tinyint` TINYINT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_bigint;
CREATE TABLE tbl_bigint
(`bigint` BIGINT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_decimal;
CREATE TABLE tbl_decimal
(`decimal` DECIMAL)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_dec;
CREATE TABLE tbl_dec
(`dec` DEC COMMENT 'DECIMAL alias')
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_numeric;
CREATE TABLE tbl_numeric
(`numeric` NUMERIC)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_float;
CREATE TABLE tbl_float
(`float` FLOAT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_double;
CREATE TABLE tbl_double
(`double` DOUBLE)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_double_precision;
CREATE TABLE tbl_double_precision
(`double_precision` DOUBLE PRECISION)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_bit;
CREATE TABLE tbl_bit
(`bit` BIT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_bool;
CREATE TABLE tbl_bool
(`bool` BOOL)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_boolean;
CREATE TABLE tbl_boolean
(`boolean` BOOLEAN)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_fixed;
CREATE TABLE tbl_fixed
(`fixed` FIXED COMMENT 'DECIMAL alias')
ENGINE=INNODB CHARSET=UTF8;

/* string types */

DROP TABLE IF EXISTS tbl_char;
CREATE TABLE tbl_char
(`char` CHAR)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_varchar;
CREATE TABLE tbl_varchar
(`varchar` VARCHAR(8))
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_binary;
CREATE TABLE tbl_binary
(`binary` BINARY)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_varbinary;
CREATE TABLE tbl_varbinary
(`varbinary` VARBINARY(8))
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_blob;
CREATE TABLE tbl_blob
(`blob` BLOB)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_text;
CREATE TABLE tbl_text
(`text` TEXT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_enum;
CREATE TABLE tbl_enum
(`enum` ENUM('Coffee', 'Tea', 'Other'))
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_set;
CREATE TABLE tbl_set
(`set` SET('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_tinyblob;
CREATE TABLE tbl_tinyblob
(`tinyblob` TINYBLOB)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_mediumblob;
CREATE TABLE tbl_mediumblob
(`mediumblob` MEDIUMBLOB)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_longblob;
CREATE TABLE tbl_longblob
(`longblob` LONGBLOB)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_tinytext;
CREATE TABLE tbl_tinytext
(`tinytext` TINYTEXT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_mediumtext;
CREATE TABLE tbl_mediumtext
(`mediumtext` MEDIUMTEXT)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_longtext;
CREATE TABLE tbl_longtext
(`longtext` LONGTEXT)
ENGINE=INNODB CHARSET=UTF8;

/* date types */

DROP TABLE IF EXISTS tbl_date;
CREATE TABLE tbl_date
(`date` DATE)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_datetime;
CREATE TABLE tbl_datetime
(`datetime` DATETIME)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_timestamp;
CREATE TABLE tbl_timestamp
(`timestamp` TIMESTAMP)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_time;
CREATE TABLE tbl_time
(`time` TIME)
ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS tbl_year;
CREATE TABLE tbl_year
(`year` YEAR)
ENGINE=INNODB CHARSET=UTF8;

/* json type */

DROP TABLE IF EXISTS tbl_json;
CREATE TABLE tbl_json
(`json` JSON)
ENGINE=INNODB CHARSET=UTF8;
