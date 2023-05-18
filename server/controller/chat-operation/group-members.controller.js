const db = require("../../db/connection.db").pool

const getGroupMembers = (req, res) => {
    const { group_id } = req.params

    const selectQuery = `SELECT user_id FROM MemberOf WHERE group_id = ?`

    db.query(selectQuery, [group_id], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else {
                res.status(404).json("No users found in the group")
            }
        }
    })
}

module.exports = { getGroupMembers }