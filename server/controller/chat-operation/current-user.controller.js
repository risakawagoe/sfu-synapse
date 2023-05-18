const db = require("../../db/connection.db").pool

const getCurrentLoginUser = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id

    const query = `SELECT user_id FROM Users WHERE user_id = ?`

    db.query(query, [userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No user_id found")
                res.status(404).json("No user_id found")
            }
        }
    })
}

module.exports = { getCurrentLoginUser }