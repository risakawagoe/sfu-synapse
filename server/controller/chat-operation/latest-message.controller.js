const db = require("../../db/connection.db").pool

const getLatestMessage = (req, res) => {
    const sender_id = req.params.sender_id
    const receiver_id = req.params.receiver_id

    const getLatestMsgQuery = `
        SELECT message, timestamp FROM DirectMessages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY id DESC
        LIMIT 1`

    db.query(getLatestMsgQuery, [sender_id, receiver_id, receiver_id, sender_id], (err, data) => {
        if (err) {
            res.status(500).json("Internal server error")
        } else {
            res.status(200).json(data)
        }
    })
}

module.exports = { getLatestMessage }