const db = require("../../db/connection.db").pool

const getDirectMessages = (req, res) => {
    const { sender_id, receiver_id } = req.params

    const selectMsgQuery = `
        SELECT * FROM DirectMessages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY id`

    db.query(selectMsgQuery, [sender_id, receiver_id, receiver_id, sender_id], (err, data) => {
        if (err) {
            res.status(500).json("Internal server error")
        } else {
            res.status(200).json(data)
        }
    });
}

module.exports = { getDirectMessages }