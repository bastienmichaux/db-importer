/*
 * goal: test queries on a single-table database (no relationships)
 * this database is not normalized on purpose
 * features simple types (string, integer, float, date, boolean), but not all types
 * (use dbi_types test database to make sure all types are translated into JSON the correct way)
 *
 * src: https://en.wikipedia.org/wiki/Long_jump_world_record_progression
 */

DROP SCHEMA IF EXISTS dbi_long_jump;
CREATE SCHEMA dbi_long_jump;
USE dbi_long_jump;

DROP TABLE IF EXISTS records;
CREATE TABLE records (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  /* record */
	mark FLOAT NOT NULL DEFAULT 0.0,
  /* comment on record */
	mark_comment VARCHAR(45) DEFAULT '',
	wind FLOAT,
	athlete_name VARCHAR(45),
	athlete_country VARCHAR(45),
	athlete_sex ENUM('M', 'F'),
	venue_town VARCHAR(45),
	venue_country VARCHAR(45),
	record_date DATE NOT NULL,
	beats_own BOOL NOT NULL DEFAULT 0 /* if that record beats the athlete's own previous record */
) ENGINE=INNODB CHARSET=UTF8;

/* fill db */
INSERT INTO records
(mark, mark_comment, wind, athlete_name, athlete_country, athlete_sex, venue_town, venue_country, record_date, beats_own)
VALUES
/* Men */
(7.61, '', null, "Peter O'Connor", 'IRE', 'M', 'Dublin', 'Ireland', '1901-08-05', FALSE),
(8.35, '', 0.0, "Ralph Boston", 'USA', 'M', 'Modesto', 'United States', '1965-05-29', FALSE),
(8.35, '', 0.0, "Igor Ter-Ovanesyan", 'URS', 'M', 'Mexico City', 'Mexico', '1964-09-12', TRUE),
(8.90, 'at Altitude', 2.0, "Bob Beamon", 'USA', 'M', 'Mexico City', 'Mexico', '1968-10-18', FALSE),
(8.95, '', 0.3, "Mike Powell", 'USA', 'M', 'Tokyo', 'Japan', '1991-08-30', FALSE),
/* Women */
(7.45, '', 0.9, "Heike Drechsler", 'GDR', 'F', 'Tallinn', 'Soviet Union', '1986-06-21', TRUE),
(7.45, '', 1.1, "Heike Drechsler", 'GDR', 'F', 'Dresden', 'East Germany', '1986-07-03', TRUE),
(7.45, '', 0.6, "Jacke Joyner-Kersee", 'USA', 'F', 'Indianapolis', 'United States', '1987-08-13', FALSE),
(7.45, '', 1.0, "Galina Chistyakova", 'URS', 'F', 'Leningrad', 'Soviet Union', '1988-06-11', FALSE),
(7.52, '', 1.4, "Galina Chistyakova", 'URS', 'F', 'Leningrad', 'Soviet Union', '1988-06-11', TRUE);
