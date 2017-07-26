const mysql = require('mysql');

const connect = (onFulFilled) => {
    const connection = mysql.createConnection({
        host: onFulFilled.host,
        port: onFulFilled.port,
        user: onFulFilled.user,
        password: onFulFilled.password,
        database: 'information_schema'
    });

    connection.config.queryFormat = function (query, values) {
        if (!values) return query;
        return query.replace(/:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
            }
            return txt;
        }.bind(this));
    };

    connection.connect((error) => {
        if (error) console.log(`error connecting : ${error}`);
    });

    return connection;
};

module.exports = {
    connect
};
