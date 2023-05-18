const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { upload } = require('../../middleware/multer.middleware')
const db = require('../../db/connection.db').pool
const dotenv = require('dotenv')
dotenv.config()


// updates a field in user table with user_id
function updateUser(user_id, field, value) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE Users SET ${field}=? WHERE user_id=?`, [value, user_id], (err) => {
            if(err) reject(err)
            resolve(`Field name '${field}' in Users table has been updated to ${value}`)
        })
    })
}

// gets value of a field in user table with user_id
function getUserField(user_id, field) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT ${field} FROM Users WHERE user_id=?`, [user_id], (err, data) => {
            if(err) reject(err)
            resolve(data)
        })
    })
}


// entry point (/user-photo).post()
const setUserPhoto = async (req, res) => {

    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }


    const user_id = req.session.user.user_id

    try {
        // delete current image if not default
        const data = await getUserField(user_id, 'photo')
        if(data[0].photo !== process.env.DEFAULT_USER_PHOTO_PATH) {
            // delete current photo
            const currentpath = data[0].photo
            const imgPath = path.join(__dirname, '..', '..', 'public') + currentpath
            fs.unlink(imgPath, (err) => {
                if(err) {
                    // console.log(err)
                    throw err
                }
                return
            })
        }

        upload(req, res, async (err) => {
            if(err instanceof multer.MulterError) {
                return res.status(500).json(err)
            }else if(err) {
                return res.status(500).json(err)
            }
            
            // save filename in database
            const filepath = '/images/uploads/' + req.file.filename
            await updateUser(user_id, 'photo', filepath)

            // send response
            return res.status(200).json(filepath)
        })
    }catch(err) {
        // console.log(err)
        res.status(500).json(err)
    }
}

const getUserPhoto = async (req, res) => {
    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    try {
        const data = await getUserField(req.session.user.user_id, 'photo')
        res.status(200).json(data[0].photo)
    }catch(err) {
        res.status(500).json(err)
    }
}

const deleteUserPhoto = async (req, res) => {

    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const user_id = req.session.user.user_id

    try {
        const data = await getUserField(user_id, 'photo')
        const currentpath = data[0].photo


        if(currentpath !== process.env.DEFAULT_USER_PHOTO_PATH) {
            const imgPath = path.join(__dirname, '..', '..', 'public') + currentpath
            fs.unlink(imgPath, (err) => {
                if(err) {
                    // console.log(err)
                    throw err
                }
                return
            })

            await updateUser(user_id, 'photo', process.env.DEFAULT_USER_PHOTO_PATH)
        }

        res.status(200).json(process.env.DEFAULT_USER_PHOTO_PATH)

    }catch(err) {
        res.status(500).json(err)
    }
}

module.exports = { updateUser, setUserPhoto, getUserPhoto, deleteUserPhoto, getUserField }