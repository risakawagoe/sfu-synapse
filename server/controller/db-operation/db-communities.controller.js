const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { upload } = require('../../middleware/multer.middleware')
const db = require('../../db/connection.db').pool
const dotenv = require('dotenv')
dotenv.config()

const updateCommunity = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.body.group_id
    const groupName = req.body.group_name
    const groupDescription = req.body.group_description
    const visibility = req.body.visibility

    // check if user is creator
    const promise = new Promise((resolve, reject) => {
        const qSelect = "SELECT community_id FROM Communities WHERE community_id=? AND created_by=?";
        db.query(qSelect, [groupId, userId], (err, data) => {
            if(err) {
                // console.log(err)
                return reject(err)
            }
            if(data.length) {
                return resolve(true) // user is creator
            }else {
                return resolve(false)
            }
        })
    })

    const creator = await promise
    if(!creator) {
        return res.status(400).json("User is not the community creator")
    }

    const updateCommunityQuery = `UPDATE Communities SET visibility=? WHERE community_id=?`

    db.query(updateCommunityQuery, [visibility, groupId], (err,data) => {
        if (err) return res.status(500).json(err);
        const updateGroupQuery = "UPDATE \`Groups\` SET group_name=?, group_description=? WHERE group_id=?";
        
        db.query(updateGroupQuery, [groupName, groupDescription, groupId], (err,data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
        })
    });
}

const deleteCommunity = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.body.group_id

    const selectQuery = `DELETE FROM \`Groups\` WHERE group_id IN (SELECT community_id FROM Communities WHERE created_by=?) AND group_id=?`

    db.query(selectQuery, [userId, groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                res.status(404).json("Not community owner or no permission")
            }
        }
    })
}

const getCommunityFromID = (req, res) => {
    const groupId = req.params.group_id
    const selectQuery = `SELECT community_id from Communities WHERE community_id =?`

    db.query(selectQuery, [groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                // console.log(data)
                res.status(200).json(data)
            } else { 
                res.status(404).json("No community or no permission")
            }
        }
    })
}

const getJoinedCommunities = (req,res) => {

    if (!req.session || !req.session.user) {
        return res.status(401).json("Login is required.")
    }
    const user_id = req.session.user.user_id
    
    const query = `SELECT
                    g.group_name,
                    g.group_description,
                    g.photo,
                    c.community_id,
                    c.visibility,
                    COUNT(DISTINCT mo2.user_id) AS member_count
                    FROM
                        Communities c
                    JOIN MemberOf mo ON c.community_id = mo.group_id
                    JOIN Users u ON mo.user_id = u.user_id
                    JOIN \`Groups\` g ON c.community_id = g.group_id
                    LEFT JOIN MemberOf mo2 ON c.community_id = mo2.group_id
                    WHERE u.user_id = ?
                    GROUP BY
                    c.community_id,
                    u.user_id`
                    
    db.query(query, [user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(409).json("There are no communities.")
        return res.status(200).json(result)
    })
}

const getCommunityVisibilityFromID = (req, res) => {
    const groupId = req.params.group_id
    const selectQuery = `SELECT visibility from Communities WHERE community_id =?`

    db.query(selectQuery, [groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                // console.log(data)
                res.status(200).json(data)
            } else { 
                res.status(404).json("No community or no permission")
            }
        }
    })
}

const checkUserIsCommunityCreator = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    const selectQuery = `SELECT created_by from Communities WHERE community_id =? AND created_by =?`

    db.query(selectQuery, [groupId, userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("Not community owner or no permission")
                res.status(404).json("Not community owner or no permission")
            }
        }
    })
}

const getCommunityPhotoFromId = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    const selectQuery = `SELECT photo FROM \`Groups\` WHERE group_id=?`

    db.query(selectQuery, [groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No community photo or no permission")
                res.status(404).json("No community photo or no permission")
            }
        }
    })
}


function getCommunityPhoto(community_id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT photo FROM \`Groups\` WHERE group_id=?`, [community_id], (err, data) => {
            if(err) reject(err)
            resolve(data)
        })
    })
}


// entry point (/community-photo).post()
const setCommunityPhoto = async (req, res) => {
    try {
        const data = await getCommunityPhoto(req.body.community_id)
        upload(req, res, async (err) => {
            if(err instanceof multer.MulterError) {
                return res.status(500).json(err)
            }else if(err) {
                return res.status(500).json(err)
            }
            // save filename in database
            const filepath = '/images/uploads/' + req.file.filename
            await updateCommunityPhotoInDb(req.body.community_id, filepath)
            // send response
            return res.status(200).json(filepath)
        })
    }catch(err) {
        // console.log(err)
        res.status(500).json(err)
    }
}


function updateCommunityPhotoInDb(community_id, value) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE \`Groups\` SET photo=? WHERE group_id=?`, [value, community_id], (err) => {
            if(err) reject(err)
            resolve(`Community photo has been updated to ${value}`)
        })
    })
}

const deleteCommunityPhoto = async (req, res) => {
    // console.log('Received request: deleteCommunityPhoto')
    try {
        const data = await getCommunityPhoto(req.body.community_id)
        const currentpath = data[0].photo
        if(currentpath !== process.env.DEFAULT_COMMUNITY_PHOTO_PATH) {
            const imgPath = path.join(__dirname, '..', '..', 'public') + currentpath
            fs.unlink(imgPath, (err) => {
                if(err) {
                    // console.log(err)
                    throw err
                }
                return
            })
            await updateCommunityPhotoInDb(req.body.community_id, process.env.DEFAULT_COMMUNITY_PHOTO_PATH)
        }
        res.status(200).json(process.env.DEFAULT_COMMUNITY_PHOTO_PATH)
    }catch(err) {
        res.status(500).json(err)
    }
}

const passOwnership = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const user_id = req.session.user.user_id
    const new_owner_id = req.body.new_owner_id
    const community_id = req.body.community_id

    const queryStr = 'UPDATE Communities SET created_by=? WHERE community_id=? AND created_by=?'

    db.query(queryStr, [new_owner_id, community_id, user_id], (err) => {
        if(err) return res.status(500).json(err)
        return res.status(200).json('Successfully passed ownership.')
    })
}

// Helper function
async function getMemberList(target_id, currentuser_id) {
    return new Promise((resolve, reject) => {
        const status = 1
        const query = 'SELECT U.user_id, U.username, U.first_name, U.last_name, U.photo FROM MemberOf M, Users U WHERE M.group_id=? AND U.user_id=M.user_id AND U.status=? AND U.user_id != ?'
        db.query(query, [target_id, status, currentuser_id], (err, data) => {
            if(err) return reject(err)
            resolve(data)
        })
    })
}

const getMembers = async (req, res) => {
    const user_id = req.session.user.user_id
    try {
        const data = await getMemberList(req.body.community_id, user_id)

        if (data || data.length > 0) {
            res.status(200).json(data)  
        } else {
            res.status(404).json("No member lists found")
        }
    }catch(err) {
        res.status(500).json(err)
    }
}


module.exports = { getJoinedCommunities, updateCommunity,deleteCommunity, getCommunityPhotoFromId, getCommunityFromID, getCommunityVisibilityFromID, checkUserIsCommunityCreator, setCommunityPhoto, getCommunityPhoto, deleteCommunityPhoto, getMembers, passOwnership }
