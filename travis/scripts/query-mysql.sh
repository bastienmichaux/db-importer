#!/usr/bin/env bash
set -ev

mkdir dev-life-dir
cd dev-life-dir

mysql < "$MYSQL"/dev_life.sql

cp "$MYSQL"/dev-life-config.json .db-config.json

node ../index

diff db-export.json "$MYSQL"/dev-life-export.json

rm .db-config.json
rm db-export.json

cd ..
rmdir dev-life-dir
