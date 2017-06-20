/* example inspired by https://jhipster.github.io/creating-an-entity#tutorial */

DROP DATABASE book_authors;

CREATE DATABASE IF NOT EXISTS book_authors;

USE book_authors;

CREATE TABLE authors (
	id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id),
	`name` VARCHAR(255) UNIQUE NOT NULL,
    birthdate DATE
) ENGINE=INNODB;

CREATE TABLE books (
	id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id),
	title VARCHAR(255) NOT NULL,
	description VARCHAR(255),
	publication_date DATE,
	price DECIMAL,
	author VARCHAR(255) NOT NULL
) ENGINE=INNODB;

ALTER TABLE books
	ADD CONSTRAINT osef FOREIGN KEY (author)
	REFERENCES authors(`name`)
;

DESCRIBE authors;
DESCRIBE books;
