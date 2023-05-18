const db = require('../db/connection.db').pool


const verifyLogin = (req, res) => {

    let username = req.body.username
    let userpass = req.body.userpass

    const query = 'SELECT * FROM Users WHERE username=?'

    db.query(query, [username], (err, data) => {
        if(err) {
            res.status(500).json(err)
        }else {
            if(data.length > 0 && data[0].status && data[0].userpass === userpass) {
                req.session.user = { user_id: data[0].user_id }
                res.status(200).json("Login: success")
            }else {
                res.status(401).json("Incorrect username or password")
            }
        }
    })
}

const verifyAdminLogin = (req, res) => {
    let adminname = req.body.adminname
    let adminpass = req.body.adminpass
    
    const query = 'SELECT * FROM Admins WHERE adminname=?'
    
    db.query(query, [adminname], (err, data) => {
        if(err) {
            res.status(500).json(err)
        }else {
            if(data.length > 0 && data[0].adminpass === adminpass) {
                req.session.admin = { admin_id: data[0].admin_id }
                res.status(200).json("Admin Login: success")
            }else {
                res.status(401).json("Incorrect adminname or password")
            }
        }
    })
}

module.exports = { verifyLogin, verifyAdminLogin }