const db = require('../db/connection.db').pool

const userLeaveGroup = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    const deleteQuery = `DELETE FROM MemberOf WHERE group_id = ? AND user_id = ?`

    db.query(deleteQuery, [groupId, userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {

            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No group or no permission")
                res.status(404).json("No group or no permission")
            }
        }
    })
}

const joinInviteLink = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    // check if user already in group
    const promise = new Promise((resolve, reject) => {
        const qSelect = "SELECT * FROM MemberOf WHERE user_id = ? AND group_id = ?";
        db.query(qSelect, [userId, groupId], (err, data) => {
            if(err) return reject(err)
            if(data.length) {
                return resolve(false) // user already in group
            }else {
                return resolve(true)
            }
        })
    })

    const unique = await promise
    if(!unique) {
        return res.status(400).json("User is already in group.")
    }

    const insertQuery = `INSERT INTO MemberOf (group_id, user_id) VALUES (?, ?);`

    db.query(insertQuery, [groupId, userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {

            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No group or no permission")
                res.status(404).json("No group or no permission")
            }
        }
    })
}

const getGroupDescriptionFromID = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    const selectQuery = `SELECT group_description from \`Groups\` WHERE group_id =?`

    db.query(selectQuery, [groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No group or no permission")
                res.status(404).json("No group or no permission")
            }
        }
    })
}


const getGroupNameFromID = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    const selectQuery = `SELECT group_name from \`Groups\` WHERE group_id =?`

    db.query(selectQuery, [groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No group or no permission")
                res.status(404).json("No group or no permission")
            }
        }
    })
}

const getGroupInviteLink = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const groupId = req.params.group_id

    const selectQuery = `SELECT group_id 
                        FROM \`Groups\` 
                        WHERE group_id = ?`

    db.query(selectQuery, [groupId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {

            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No group or no permission")
                res.status(404).json("No group or no permission")
            }
        }
    })
}

const getCourseGroups = (req, res) => {

    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id

    const selectQuery = `SELECT M.group_id, G.group_name, G.photo
                        FROM MemberOf M, \`Groups\` G, Courses C 
                        WHERE M.group_id = G.group_id 
                        AND G.group_id = C.course_id
                        AND M.user_id = ?`

    // Separate query to get number of members
    const countMembersQuery = `SELECT M.group_id, COUNT(DISTINCT M.user_id) AS num_members
                            FROM MemberOf M, \`Groups\` G, Courses C, Users U
                            WHERE M.group_id = G.group_id
                            AND G.group_id = C.course_id
                            AND M.user_id = U.user_id
							AND U.status = 1
                            GROUP BY M.group_id`

    db.query(selectQuery, [userId], (err, groupData) => {
        if (err) {
            // console.log(err);
            res.status(500).json("Internal server error");
        } else {
            db.query(countMembersQuery, (err, memberCountData) => {
                if (err) {
                    // console.log(err);
                    res.status(500).json("Internal server error");
                } else {
                    // combined groups and number of memebers data 
                    const combinedData = groupData.map(group => {
                        const memberCount = memberCountData.find(m => m.group_id === group.group_id)
                        return {
                            ...group,
                            num_members: memberCount ? memberCount.num_members : 0,
                        }
                    })

                    if (combinedData && combinedData.length > 0) {
                        res.status(200).json(combinedData);
                    } else {
                        // console.log("No course groups found")
                        res.status(404).json("No course groups found")
                    }
                }
            })
        }
    })
}

const createGroup = (req, res) => {
    res.send(`Received ${req.method} request to /groups`)
}

module.exports = { userLeaveGroup, joinInviteLink, getGroupDescriptionFromID, getGroupNameFromID, getGroupInviteLink, getCourseGroups, createGroup }