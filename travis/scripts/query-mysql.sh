#!/usr/bin/env bash
set -ev

mysql < "$MYSQL"/dev_life.sql

mysql 'information_schema' < "$MYSQL"/tables.sql
mysql 'information_schema' < "$MYSQL"/columns.sql
mysql 'information_schema' < "$MYSQL"/all-constraints.sql
mysql 'information_schema' < "$MYSQL"/one-to-one.sql
mysql 'information_schema' < "$MYSQL"/many-to-one.sql
mysql 'information_schema' < "$MYSQL"/many-to-many.sql
