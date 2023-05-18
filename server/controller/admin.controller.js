const { v4: uuidv4 } = require('uuid')
const dotenv = require('dotenv')
dotenv.config()
const db = require('../db/connection.db').pool


// adds a single section in a course
const addSection = (req, res) => {
    const year = req.body.year
    const term = req.body.term
    const dep = req.body.dep
    const num = req.body.num
    const section = req.body.section
    const title = req.body.title
    if(year && term && dep && num && section) {
        const entryID = uuidv4()
        const photo = process.env.DEFAULT_COURSE_PHOTO_BASEPATH + getRandomInteger(1, 5) + '.png'
        const groupName = `${dep.toUpperCase() + num.toUpperCase()} ${section.toUpperCase()}`
        const query1 = 'INSERT INTO `Groups`(group_id, group_name, group_description, photo) VALUES(?, ?, ?, ?);'
        const query2 = 'INSERT INTO Courses(course_id, offered_year, offered_term, dep, num, section, title) VALUES(?, ?, ?, ?, ?, ?, ?);'

        db.query((query1 + query2), [
            entryID,
            groupName,
            title,
            photo,
            entryID,
            year.toString(),
            term,
            dep,
            num,
            section,
            title
        ], (err, data) => {
            if(err) {
                // console.log(err)
                res.status(500).json(err)
            }else {
                res.status(200).json(data)
            }
        })
    }else {
        res.status(400).json("Insufficient information. Please provide all parameters.")
    }
}

// adds all sections in a course
const addCourse = async (req, res) => {
    const year = req.body.year
    const term = req.body.term
    const dep = req.body.dep
    const num = req.body.num
    var url = `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}/${dep}/${num}`
    
    // TODO: for each section, add to database
    // console.log('GET ' + url)
    const result = await fetch(url);
    const list = await result.json()

    if(typeof list[Symbol.iterator] === 'function') {
        const size = list.length
        var i = 0

        for(let item of list) {

            // add to database
            const result = await addSection_(year, term, dep, num, item.value, item.title)

            if(result) {
                i++
                if(i === size) {
                    res.status(200).json("Successfully added all sections for " + term.toUpperCase() + year.toString() + ' ' + dep.toUpperCase() + num.toUpperCase())
                }
            }
        }
    }
}

// deletes a single section in a course
const deleteSection = (req, res) => {
    const year = req.body.year
    const term = req.body.term
    const dep = req.body.dep
    const num = req.body.num
    const section = req.body.section

    if(year && term && dep && num && section) {
        const query = 'DELETE FROM `Groups` WHERE group_id IN (SELECT course_id FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=? AND section=?)'

        db.query((query), [
            year.toString(),
            term,
            dep,
            num,
            section
        ], (err, data) => {
            if(err) {
                // console.log(err)
                res.status(500).json(err)
            }else {
                res.status(200).json(data)
            }
        })
    }else {
        res.status(400).json("Insufficient information. Please provide all parameters.")
    }
}

// deletes all sections in a course
const deleteCourse = (req, res) => {
    const year = req.body.year
    const term = req.body.term
    const dep = req.body.dep
    const num = req.body.num
    
    if(year && term && dep && num) {
        const query = 'DELETE FROM `Groups` WHERE group_id IN (SELECT course_id FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=?)'

        db.query((query), [
            year.toString(),
            term,
            dep,
            num
        ], (err, data) => {
            if(err) {
                res.status(500).json(err)
            }else {
                res.status(200).json(data)
            }
        })
    }else {
        res.status(400).json("Insufficient information. Please provide all parameters.")
    }
}

// test function, to be integrated into others when refining code
async function addSection_(year, term, dep, num, section, title) {
    if(year && term && dep && num && section && title) {
        return new Promise(function(resolve) {
            const id = uuidv4()
            const photo = process.env.DEFAULT_COURSE_PHOTO_BASEPATH + getRandomInteger(1, 5) + '.png'
            const groupName = `${dep.toUpperCase() + num.toUpperCase()} ${section.toUpperCase()}`
            const query1 = 'INSERT INTO `Groups`(group_id, group_name, group_description, photo) VALUES(?, ?, ?, ?);'
            const query2 = 'INSERT INTO Courses(course_id, offered_year, offered_term, dep, num, section, title) VALUES(?, ?, ?, ?, ?, ?, ?);'
            var params = [id, groupName, title, photo, id, year, term, dep, num, section, title]
                
            db.query((query1 + query2), params, (err, data) => {
                if(err) {
                    return reject(err)
                }
                resolve(data)
            })
        })
    }else {
        return undefined
    }
}

// helper function
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// '/api/admin/logout' .post()
const adminLogout = (req, res) => {
    // console.log('Received request: adminLogout')

    if(!req.session || !req.session.admin) {
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


module.exports = { addSection, addCourse, deleteSection, deleteCourse, adminLogout }