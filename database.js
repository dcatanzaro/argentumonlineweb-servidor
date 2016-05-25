module.exports = database;

var mysql = require('mysql');

var database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aoweb'
});

module.exports = database;
