const db = require('../db/connection.db').pool
const viewLevel = { deps: 0, courses: 1, sections: 2 }

const fetchCourseInfo = async (req, res) => {
    // console.log('fetching course information')
    const year = req.body.year
    const term = req.body.term
    const dep = req.body.dep
    const num = req.body.num
    var url = `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}`
    var level = viewLevel.deps

    if(num) {
        // get sections given (year, term, dep, num)
        url += `/${dep}/${num}`
        level = viewLevel.sections
    }else if(dep) {
        // get courses given (year, term, dep)
        url += `/${dep}`
        level = viewLevel.courses
    }
    
    // console.log(`GET ` + url)

    // fetching information
    const result = await fetch(url)
    if(result.status !== 200) {
        res.status(404).json("No data found.")
        return
    }

    const list = await result.json()
    // console.log(list)
    if(level === viewLevel.deps) {
        res.status(200).json(list)
        return
    }

    try {
        await Promise.all(list.map(async (item) => {
            var targetDep = dep
            var targetCourse = ''
            var targetSection = ''

            if(level === viewLevel.courses) {
                targetCourse = item.value
            }else if(level === viewLevel.sections) {
                targetCourse = num
                targetSection = item.value
            }

            const recordCountPromise = getRecordCount(year, term, targetDep, targetCourse, targetSection)
            const subCountPromise = getSubCount(year, term, targetDep, targetCourse, targetSection)

            const [recordCount, subCount] = await Promise.all([recordCountPromise, subCountPromise])
            item.status = status(recordCount, subCount)
        }))

        // console.log(list)
        res.status(200).json(list)

    }catch(err) {
        res.status(500).json(err)
    }
}


// helper function: computes the status by comparing rec-count and sub-count
function status(rec, sub) {
    if(rec === 0) {
        // none added to courses
        return 0
    }else if(rec === sub) {
        // all added to courses
        return 1
    }else {
        // partially added to courses
        return 2
    }
}


async function getSubCount(year, term, dep, num, section) {
    return new Promise( async (resolve, reject) => {
        if(section !== '') {
            resolve(1)
        }else if(num !== '') {
            var url = `http://www.sfu.ca/bin/wcm/course-outlines?${year}/${term}/${dep}/${num}`

            try {
                const response = await fetch(url)
                if(response.status !== 200) reject()
                
                const list = await response.json()
                if(typeof list[Symbol.iterator] === 'function') {
                    resolve(list.length)
                }else {
                    resolve(0)
                }
            }catch(err) {
                reject()
            }
            // fetch(url)
            //     .then(result => result.json())
            //     .then(list => {
            //         if(typeof list[Symbol.iterator] === 'function') {
            //             resolve(list.length)
            //         }

            //     })
        }else {
            resolve(0)
        }
    })
}


async function getRecordCount(year, term, dep, num, section) {

    return new Promise(function(resolve, reject) {

        var query = ''
        var params = []
    
        if(section !== '') {
            query = 'SELECT * FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=? AND section=?'
            params = [year, term, dep, num, section]
        }else if(num !== '') {
            query = 'SELECT * FROM Courses WHERE offered_year=? AND offered_term=? AND dep=? AND num=?'
            params = [year, term, dep, num]
        }else {
            // return 0
            resolve(0)
        }
    
        db.query(query, params, (err, data) => {
            if(err) {
                // return reject(err)
                reject(err)
                // return 0
            }
            resolve(data.length)
        })
    })
}

module.exports = { fetchCourseInfo }