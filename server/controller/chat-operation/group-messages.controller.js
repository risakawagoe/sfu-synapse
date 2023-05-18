const db = require('../../db/connection.db').pool

const getGroupMessages = (req, res) => {
    const { group_id } = req.params

    const selectGroupMsgQuery = `
        SELECT * FROM GroupMessages
        WHERE group_id = ?
        ORDER BY id`

    db.query(selectGroupMsgQuery, [group_id], (err, data) => {
        if (err) {
            res.status(500).json("Internal server error")
        } else {
            res.status(200).json(data)
        }
    })
}

module.exports = { getGroupMessages }