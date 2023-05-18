const checkLoginStatus = (req, res) => {
    // console.log('checkLoginStatus')

    const userType = req.params.userType
    // console.log(req.session)

    if(userType === 'user' && req.session.user) {
        return res.sendStatus(200)
    }
    
    if(userType === 'admin' && req.session.admin) {
        return res.sendStatus(200)
    }

    return res.sendStatus(401)
}

// '/api/logout' .post()
const logout = (req, res) => {
    // console.log('Received request: logoutUser')

    if(!req.session || !req.session.user) {
        res.sendStatus(401)
    }

    // console.log('destroying session')
    req.session.destroy(err => {
        if(err) {
          return res.status(500).json(err)
        }
        return res.status(200).json('Logout successful')
    })
}

module.exports = { checkLoginStatus, logout }