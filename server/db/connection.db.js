const mysql = require('mysql')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root@synapse',
    database: 'synapse_app',
    connectionLimit: 100,
    multipleStatements: true
})

module.exports = { pool }