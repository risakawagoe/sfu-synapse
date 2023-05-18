const { updateUser } = require('./db-operation/db-users.controller')

// updates bio
const setProfileBio = async (req, res) => {

    if(req.session && req.session.user) {
        try {
            await updateUser(req.session.user.user_id, 'bio', req.body.bio)
            res.status(200).json('Setting profile bio: success')
        }catch(err) {
            // console.log(err)
            res.status(500).json(err)
        }
    }else {
        res.sendStatus(401)
    }
}


module.exports = { setProfileBio }