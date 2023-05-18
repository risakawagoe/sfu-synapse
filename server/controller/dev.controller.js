const db = require('../db/connection.db').pool


const getTableData = (req, res) => {
    db.query(`SELECT * FROM ${req.params.table}`, (err, data) => {
        if(err) {
            res.status(500).json(err)
        }
        res.status(200).json(data)
    })
}

module.exports = { getTableData }