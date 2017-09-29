/*
 * this database should hold all possible relationships for mysql 5.7
 * we use real-world values (European countries, their ISO codes, biggest cities, official languages)
 *
 * goal: test conversion of relationships from mysql to JSON
 * each property of a JHipster entity 'relationships' object should exist after conversion
 *
 * relationships:
 * (see www.jhipster.tech/managing-relationships#available-relationships)
 * Note: the unidirectional / bidirectional concept isn't at the db level, it exists on the implementation level
 *
 * - one-to-one between countries and country_codes (each country has only one iso code)
 * - one-to-many between countries and cities (each country has one or more cities)
 * - one-to-one between countries and cities, where the city is a capital (each country has only one capital - actually that's not true but that's for testing)
 * - many-to-many between countries and languages (each country has one or more official languages, and each language is official in one or more countries)
 * - reflexive one-to-many between countries (each country has one or more neighbor countries)
 *
 * src: https://en.wikipedia.org/wiki/List_of_sovereign_states_and_dependent_territories_in_Europe
 * (and related pages) consulted in august 2017, in case of discrepancies probably blame separatists or Russia
 */

DROP SCHEMA IF EXISTS dbi_europe;
CREATE SCHEMA dbi_europe;
USE dbi_europe;

/* Table structure for table `cities` */
DROP TABLE IF EXISTS `cities`;
CREATE TABLE `cities` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` CHAR(35) NOT NULL DEFAULT 'N/A',
  `country` INT(11) NOT NULL,
  `is_capital` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8;


/* Table structure for table `countries` */
DROP TABLE IF EXISTS `countries`;
CREATE TABLE `countries` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` CHAR(35) NOT NULL DEFAULT 'N/A',
  `continent` ENUM('asia', 'europe', 'north america', 'africa', 'oceania', 'antarctica', 'south america') NOT NULL DEFAULT 'europe',
  `capital` INT(11) DEFAULT NULL,
  `code` CHAR(2) DEFAULT '', /* iso 3166-1 alpha-2 code */
  /* country code allows null because iso standard doesn't currently include countries like Kosovo */
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8;


/* Table structure for table `code` */
DROP TABLE IF EXISTS `country_codes`;
CREATE TABLE `country_codes` (
  `code` CHAR(2) NOT NULL DEFAULT '', /* iso 3166-1 alpha-2 code */
  PRIMARY KEY (`code`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8;


/* Table structure for table `languages` */
DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` CHAR(52) NOT NULL DEFAULT '',
  `iso_code` CHAR(3) NOT NULL DEFAULT '', /* iso 639.3 */
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8;

/* many-to-many relationship through a junction table */
DROP TABLE IF EXISTS `country_languages`;
CREATE TABLE `country_languages` (
  `country_id` INT(11) NOT NULL,
  `language_id` INT(11) NOT NULL,
  PRIMARY KEY (`country_id`, `language_id`),
  CONSTRAINT country_languages_country_fk FOREIGN KEY (`country_id`) REFERENCES countries(`id`),
  CONSTRAINT country_languages_language_fk FOREIGN KEY (`language_id`) REFERENCES languages(`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8;

/* reflexive one-to-many relationship through a junction table */
DROP TABLE IF EXISTS `country_neighbors`;
CREATE TABLE `country_neighbors` (
  `country_id` INT(11) NOT NULL,
  `neighbor_id` INT(11) NOT NULL,
  PRIMARY KEY (`country_id`, `neighbor_id`),
  CONSTRAINT neighbor_country_fk FOREIGN KEY (`country_id`) REFERENCES countries(`id`),
  CONSTRAINT neighbors_fk FOREIGN KEY (`neighbor_id`) REFERENCES countries(`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8;

/* implement relationships */

/* one to one between countries and code */
ALTER TABLE `countries`
ADD CONSTRAINT country_code_fk FOREIGN KEY (`code`) REFERENCES country_codes(`code`)
ON UPDATE CASCADE
ON DELETE CASCADE;

/* one to many between countries and cities */
ALTER TABLE `countries`
ADD CONSTRAINT country_capital_fk FOREIGN KEY (`capital`) REFERENCES cities(`id`)
ON UPDATE CASCADE
ON DELETE CASCADE;

/* one to one between cities and countries */
ALTER TABLE `cities`
ADD CONSTRAINT city_country_fk FOREIGN KEY (`country`) REFERENCES countries(`id`)
ON UPDATE CASCADE
ON DELETE CASCADE;
