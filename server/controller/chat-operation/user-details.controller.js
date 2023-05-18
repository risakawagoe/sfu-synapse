const db = require("../../db/connection.db").pool

const getUserDetails = (req, res) => {
    const { userId } = req.params
    
    const query = 'SELECT * FROM Users WHERE user_id = ?'
    db.query(query, [userId], (err, data) => {
        if (err) {
            // console.error(err)
            res.status(500).json("Internal server error")
        } else {
            const user = data[0]
            if (user) {
                res.status(200).json(user)
            } else {
                res.status(404).json("User not found")
            }
        }
    })
}

module.exports = { getUserDetails }