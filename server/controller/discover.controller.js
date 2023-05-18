const db = require('../db/connection.db').pool

async function getTargetUserFullProfile(target_id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT username, first_name, last_name, bio, photo FROM Users WHERE user_id=?'
        db.query(query, [target_id], (err, data) => {
            if(err) return reject(err)
            return resolve(data[0])
        })
    })
}

async function getTargetUserCourseHistory(target_id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT G.group_name, G.group_description, G.photo FROM MemberOf M, Courses C, `Groups` G WHERE M.group_id=C.course_id AND G.group_id=C.course_id AND M.user_id=?'
        db.query(query, [target_id], (err, data) => {
            if(err) return reject(err)
            resolve(data)
        })
    })
}

async function getTargetUserCommunities(target_id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT G.group_name, G.group_description, G.photo FROM MemberOf M, Communities C, `Groups` G WHERE M.group_id=C.community_id AND G.group_id=C.community_id AND M.user_id=?'
        db.query(query, [target_id], (err, data) => {
            if(err) return reject(err)
            resolve(data)
        })
    })
}

const getUnconnectedGroupMembers = async (req, res) => {

    if (!req.session || !req.session.user) {
        return res.status(401).json("Login is required.")
    }
    const user_id = req.session.user.user_id
    const group_id = req.params.group_id

    // get all info of users who are a member of the current group 
    // but do not have a connection with the current user
    const query = `SELECT * 
                    FROM Users 
                    WHERE user_id IN
                        (SELECT user_id 
                        FROM MemberOf 
                        WHERE group_id = ? AND user_id != ? AND user_id NOT IN 
                            (SELECT userA_id AS user_id
                            FROM Connections
                            WHERE userB_id = ?
                            UNION 
                            SELECT userB_id AS user_id
                            FROM Connections
                            WHERE userA_id = ?)
                        )`

    db.query(query, [group_id, user_id, user_id, user_id], async (err, result) => {
        if (err) return res.status(500).json(err)
        if (result.length === 0) return res.status(404).json("No users to connect with.")

        try {
            const unconnectedMembers = []

            for (const user of result) {
                const target_id = user.user_id

                const courses = await getTargetUserCourseHistory(target_id)
                const communities = await getTargetUserCommunities(target_id)
                
                unconnectedMembers.push({
                    user: user,
                    courses: courses,
                    communities: communities
                })
            }

    
            res.status(200).json(unconnectedMembers)
        }catch(err) {
            return res.status(500).json(err)
        }
    })
}

module.exports = { getUnconnectedGroupMembers }