const db = require('../db/connection.db').pool

// ENTRY POINT: '/api/:year/:term'
const getHomeContent = async (req, res) => {
    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const user_id = req.session.user.user_id
    const year = req.params.year
    const term = req.params.term
    

    try {
        const user = await getUser(user_id)
        const connections = await getConnections(user_id)
        const courses = await getCourses(user_id, year, term)
        const communities = await getCommunities(user_id)
        
        const resObj = {
            user: user,
            connections: connections,
            courses: courses,
            communities: communities
        }

        // console.log(resObj)
        res.status(200).json(resObj)
    }catch(err) {
        // console.log(err)
        return res.status(500).json(err)
    }
}


// ENTRY POINT: '/home/:type/:id'
const fetchInfo = async (req, res) => {
    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    
    const type = req.params.type
    const id = req.params.id
    // console.log('\n\n\nReceived request: fetchInfo { ' + type + ', ' + id + ' }')

    try {
        if(type === 'user') {
            // console.log('fetching info for user')
            // 1. get full user profile
            const fullProfile = await getTargetUserFullProfile(id)
            // console.log(fullProfile)

            // 2. get all courses enrolled in (all in history)
            const courseHistory = await getTargetUserCourseHistory(id)
            // console.log(courseHistory)
    
            // 3. get all communities
            const communities = await getTargetUserCommunities(id)
            // console.log(communities)

            const resObj = {
                fullProfile: fullProfile,
                courseHistory: courseHistory,
                communities: communities
            }

            res.status(200).json(resObj)
        }else if(type === 'group') {
            // console.log('fetching info for group')

            // 1. get full group profile
            const fullProfile = await getFullGroupProfile(id)
            // console.log(fullProfile)

            // 2. get number of members
            const memberCount = await getMemberCount(id)
            // console.log(memberCount)
            
            // 3. get list of members
            const memberList = await getMemberList(id)
            // console.log(memberList)

            const resObj = {
                fullProfile: fullProfile,
                memberCount: memberCount,
                memberList: memberList
            }

            res.status(200).json(resObj)
        }else {
            return res.status(400).json('Due to missing parameters, server was not able to process your request.')
        }

    }catch(err) {
        // console.log(err)
        res.status(500).json(err)
    }
}

// helper functions
async function getUser(user_id) {
    return new Promise((resolve, reject) => {
        const status = 1
        // console.log(user_id, status)
        const query = 'SELECT user_id, username, first_name, last_name, photo, bio FROM Users WHERE user_id=? AND status=?'
        db.query(query, [user_id, status], (err, data) => {
            if(err) return reject(err)
            return resolve(data[0])
        })
    })
}

async function getConnections(user_id) {
    return new Promise((resolve, reject) => {
        const qStr = `(SELECT U.user_id, U.username, U.first_name, U.last_name, U.photo, C.status FROM Users U, (SELECT userB_id AS connected_user_id, status FROM Connections WHERE userA_id=?) AS C WHERE U.user_id=C.connected_user_id) UNION (SELECT U.user_id, U.username, U.first_name, U.last_name, U.photo, C.status FROM Users U, (SELECT userA_id AS connected_user_id, status FROM Connections WHERE userB_id=?) AS C WHERE U.user_id=C.connected_user_id);`
        db.query(qStr, [user_id, user_id], (err, data) => {
            if(err) return reject(err)
            return resolve(data)

        })
    })
}

async function getCourses(user_id, year, term) {
    return new Promise((resolve, reject) => {
        // console.log(user_id, year, term)
        const query = 'SELECT C.course_id, G.group_name, G.group_description, G.photo FROM MemberOf M, Courses C, `Groups` G WHERE M.group_id=C.course_id AND C.course_id=G.group_id AND M.user_id=? AND C.offered_year=? AND C.offered_term=?'
        db.query(query, [user_id, year, term], (err, data) => {
            if(err) return reject(err)
            // console.log(data)
            return resolve(data)
        })
    })
}
async function getCommunities(user_id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT C.community_id, G.group_name, G.group_description, G.photo, C.created_by, C.visibility FROM MemberOf M, Communities C, `Groups` G WHERE M.group_id=C.community_id AND C.community_id=G.group_id AND M.user_id=?'
        db.query(query, [user_id], (err, data) => {
            if(err) return reject(err)
            return resolve(data)
        })
    })
}

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

async function getFullGroupProfile(target_id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT group_name, group_description, photo FROM `Groups` WHERE group_id=?'
        db.query(query, [target_id], (err, data) => {
            if(err) return reject(err)
            resolve(data[0])
        })
    })
}
async function getMemberCount(target_id) {
    return new Promise((resolve, reject) => {
        const status = 1
        const query = 'SELECT COUNT(*) AS memberCount FROM MemberOf M, Users U WHERE M.user_id=U.user_id AND U.status=? AND M.group_id=?'
        db.query(query, [status, target_id], (err, data) => {
            if(err) return reject(err)
            resolve(data[0].memberCount)
        })
    })
}
async function getMemberList(target_id) {
    return new Promise((resolve, reject) => {
        const status = 1
        const query = 'SELECT U.username, U.first_name, U.last_name, U.photo FROM MemberOf M, Users U WHERE M.group_id=? AND U.user_id=M.user_id AND U.status=?'
        db.query(query, [target_id, status], (err, data) => {
            if(err) return reject(err)
            resolve(data)
        })
    })
}



// async function getFullCourse

const getApp = (req, res) => {
    // console.log('Received request: getApp')
    res.status(200).json('Retrieving data for SFU Synapse.')
}



module.exports = { getHomeContent, getApp, fetchInfo }