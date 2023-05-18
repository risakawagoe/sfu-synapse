/*
Filename: db-courses.controller.js
Purpose: getting data from Courses table in database
*/
const db = require('../../db/connection.db').pool

// gets all deparments for a given semester stored in database
const getDepartments = async (req, res) => {
    const year = req.params.year
    const term = req.params.term

    if(!(year && term)) {
        res.status(400).json('Missing properties. Could not query database')
        return
    }

    const queryStr = 'SELECT DISTINCT dep FROM Courses WHERE offered_year=? AND offered_term=? ORDER BY dep'
    const queryParams = [year, term]

    try {
        const data = await queryDB(queryStr, queryParams)
        // console.log(data)
        res.status(200).json(data)
        return
    }catch(err) {
        // console.log(err)
        res.status(500).json('Databse query failed')
        return
    }
}
const getCourses = async (req, res) => {
    const year = req.params.year
    const term = req.params.term
    const dep = req.params.dep
    
    if(!(year && term && dep)) {
        res.status(400).json('Missing properties. Could not query database')
        return
    }
    
    const queryStr = 'SELECT DISTINCT num FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? ORDER BY num'
    const queryParams = [year, term, dep]
    
    try {
        const data = await queryDB(queryStr, queryParams)
        // console.log(data)
        res.status(200).json(data)
        return
    }catch(err) {
        // console.log(err)
        res.status(500).json('Databse query failed')
        return
    }
}

const getSections = async (req, res) => {
    const year = req.params.year
    const term = req.params.term
    const dep = req.params.dep
    const num = req.params.course
    
    if(!(year && term && dep  && num)) {
        res.status(400).json('Missing properties. Could not query database')
        return
    }
    
    // console.log(year, term, dep, num)
    const queryStr = 'SELECT dep, num, section FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=? ORDER BY dep, num, section'
    const queryParams = [year, term, dep, num]
    
    try {
        const data = await queryDB(queryStr, queryParams)
        // console.log(data)
        res.status(200).json(data)
        return
    }catch(err) {
        // console.log(err)
        res.status(500).json('Databse query failed')
        return
    }

}


async function queryDB(queryStr, queryParams) {
    return new Promise((resolve, reject) => {
        db.query(queryStr, queryParams, (err, data) => {
            if(err) {
                return rejec(err)
            }
            return resolve(data)
        })
    })


}


// gets all courses a user (with userid) is enrolled in the given semester
const getEnrolledCourses = async (req, res) => {

    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    // const username = req.session.user.username
    const user_id = req.session.user.user_id
    const year = req.params.year
    const term = req.params.term
    // console.log(user_id, year, term)



    const queryStr = 'SELECT C.dep, C.num, C.section FROM MemberOf M, Courses C WHERE M.group_id=C.course_id AND M.user_id=? AND C.offered_year=? AND C.offered_term=? ORDER BY C.dep, C.num, C.section'
    db.query(queryStr, [user_id, year, term], (err, data) => {
        if(err) {
            // console.log(err)
            res.status(500).json(err)
        }
        res.status(200).json(data)
    })
}

const addUserToCourse = (req, res) => {

    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    // const username = req.session.user.username
    const user_id = req.session.user.user_id
    const year = req.params.year
    const term = req.params.term
    const dep = req.params.dep
    const num = req.params.num
    const section = req.params.section

    // console.log(user_id, year, term, dep, num, section)
    
    const queryStr = 'INSERT INTO MemberOf (group_id, user_id) VALUES ((SELECT course_id FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=? AND section=?), ?)'
    db.query(queryStr, [year, term, dep, num, section, user_id], (err) => {
        if(err) res.status(500).json(err)
        res.status(200).json("Database insertion: success!")
        return
    })
}

const removeUserFromCourse = async (req, res) => {

    if(!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    // const username = req.session.user.username
    const user_id = req.session.user.user_id
    const year = req.params.year
    const term = req.params.term
    const dep = req.params.dep
    const num = req.params.num
    const section = req.params.section

    const queryStr = 'DELETE FROM MemberOf WHERE group_id=(SELECT course_id FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=? AND section=?) AND user_id=?'
    db.query(queryStr, [year, term, dep, num, section, user_id], (err) => {
        if(err) {
            // console.log(err)
            res.status(500).json(err)
        }
        res.status(200).json("Database deletion: success!")
        return
    })
}



module.exports = { getDepartments, getCourses, getSections, getEnrolledCourses, removeUserFromCourse, addUserToCourse }