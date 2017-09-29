/*
 * goal: test a simple db that jhipster collaborators are familiar with
 *
 * relationships:
 * - oneToMany between Authors and Books (one author can write many books)
 *
 * src: http://www.jhipster.tech/creating-an-entity
 */

DROP SCHEMA IF EXISTS dbi_book_author;
CREATE SCHEMA dbi_book_author;
USE dbi_book_author;

DROP TABLE IF EXISTS books;
CREATE TABLE books (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description VARCHAR(255),
  publication_date DATE,
  price BIGINT,
  author INT NOT NULL
) ENGINE=INNODB CHARSET=UTF8;

DROP TABLE IF EXISTS authors;
CREATE TABLE authors (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`name` VARCHAR(255),
	birth_date DATE
) ENGINE=INNODB CHARSET=UTF8;

ALTER TABLE books
ADD CONSTRAINT books_fk FOREIGN KEY (author) REFERENCES authors(id)
ON UPDATE CASCADE
ON DELETE CASCADE;
