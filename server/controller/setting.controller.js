const db = require('../db/connection.db').pool
const path = require('path');
const fs = require('fs')
const { getUserField } = require('../controller/db-operation/db-users.controller')
const dotenv = require('dotenv');
dotenv.config()

const getSettings = (req, res) => {
    
    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const qSelect = "SELECT username, bio, photo FROM Users WHERE user_id = ?";
    
    db.query(qSelect, [req.session.user.user_id], (err,data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).send(data);
    });
}

const updateSettings = async (req, res) => {

    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    // check if username is unique
    const promise = new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) AS count FROM Users WHERE username=? AND user_id!=?', [req.body.username, req.session.user.user_id], (err, data) => {
            if(err) reject(err)
            resolve(data[0].count)
        })
    })

    try {
        const count = await promise
        // console.log(count + ' accounts with the same username')
        if(count > 0) {
            return res.status(400).json('This username is already taken. Please choose another one.')
        }
    }catch(err) {
        // console.log(err)
        return res.status(500).json(err)
    }

    const values = [
        req.body.username,
        req.body.bio,
        req.session.user.user_id,
    ];

    // console.log(req.body.username, req.body.bio, req.session.user.user_id)

    const qUpdate = "UPDATE Users SET username=?, bio=? WHERE user_id = ?"

    db.query(qUpdate, values, (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User settings have been updated.");
    });
}

const updatePassoword = async (req, res) => {
    // console.log('Received request: updatePassoword')
    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    try {
        // compare with current password
        const data = await getUserField(req.session.user.user_id, 'userpass')
        if(data[0].userpass !== req.body.oldPassword) {
            return res.status(400).json('Incorrect password.')
        }
    }catch(err) {
        res.status(500).json(err)
    }

    // update password
    const qUpdate = "UPDATE Users SET userpass=? WHERE user_id = ?"
    db.query(qUpdate, [req.body.newPassword, req.session.user.user_id], (err) => {
        if(err) {
            return res.status(500).json(err)
        }
        return res.status(200).json("User password has been updated.")
    })
}

const deleteAccount = async (req, res) => {
    // console.log('Received request: deleteAccount')
    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const user_id = req.session.user.user_id

    try {
        // compare with current password
        const data1 = await getUserField(user_id, 'userpass')
        if(data1[0].userpass !== req.body.password) {
            return res.status(400).json('Incorrect password.')
        }



        // 1. check if user is owner (creater) of any community
        // console.log('1. check if user is owner (creater) of any community')
        const promise1 = new Promise((resolve, reject) => {
            const qSearch = 'SELECT COUNT(community_id) AS ownership FROM Communities WHERE created_by=?'
            db.query(qSearch, [user_id], (err, data) => {
                if(err) {
                    reject(err)
                }
                resolve(data[0].ownership)
            })
        })

        const count = await promise1
        // console.log('Ownership: ' + count)
        if(count > 0) {
            return res.status(400).json(`It seems you are an owner of ${count} community group${count > 1 ? 's' : ''}. Please transfer all ownership before attempting to delete your account.`)
        }


        // get current photo path (before updating database)
        const data2 = await getUserField(user_id, 'photo')


        // 2. update user in database
        // console.log('2. update user in database')
        const promise2 = new Promise((resolve, reject) => {
            const values = [
                '<anonymous>', 
                'Deleted', 
                'Account', 
                user_id, 
                '', 
                process.env.DEFAULT_DELETED_USER_PHOTO_PATH,
                null, 
                0, 
                user_id
            ]
        
            const qDelete = "UPDATE Users SET username=?, first_name=?, last_name=?, email=?, userpass=?, photo=?, bio=?, status=? WHERE user_id = ?";
    
            db.query(qDelete, values, (err) => {
                if (err) {
                    // console.log(err)
                    reject(err)
                }
                resolve()
            });
        })
        
        await promise2
        
        
        
        // 3. delete uploaded photo
        // console.log('3. delete uploaded photo')
        if(data2[0].photo !== process.env.DEFAULT_USER_PHOTO_PATH) {
            const imgPath = path.join(__dirname, '..', 'public') + data2[0].photo
            fs.unlink(imgPath, (err) => {
                if(err) {
                    // console.log(err)
                    throw err
                }
            })
        }

        // 4. set status to of any connection involving deleted user to 'inactive'
        // console.log('deactivating connections')
        const promise3 = await new Promise((resolve, reject) => {
            const query = 'UPDATE Connections SET status="inactive" WHERE userA_id=?;UPDATE Connections SET status="inactive" WHERE userB_id=?;'
            db.query(query, [user_id, user_id], (err) => {
                if(err) return reject(err)
                return resolve()
            })
        })
        await promise3


        // 4. remove user from all groups
        const promise4 = await new Promise((resolve, reject) => {
            const query = 'DELETE FROM MemberOf WHERE user_id=?'
            db.query(query, [user_id], (err) => {
                if(err) return reject(err)
                return resolve()
            })
        })
        await promise4

        // console.log('all done')
        req.session.destroy()
        res.status(200).json('Account successfully deleted.')

    }catch(err) {
        // console.log(err)
        return res.status(500).json(err)
    }
}


module.exports = { getSettings, updateSettings, updatePassoword, deleteAccount }