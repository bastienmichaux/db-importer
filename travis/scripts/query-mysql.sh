#!/usr/bin/env bash
set -ev

mysql < "$MYSQL"/dev_life.sql

cp -t . "$MYSQL"/.db-config.json

node index

diff db-export.json "$MYSQL"/dev-life-export.json
