const { v4: uuidv4 } = require('uuid');

const db = require('../db/connection.db').pool

async function checkUniqueName(community_name) {
    return new Promise((resolve, reject) => {
        const qSelect = "SELECT * FROM \`Groups\` WHERE group_name = ?"
        db.query(qSelect, [community_name], (err, data) => {
            if (err) reject(err)
            if (data.length) {
                reject(new Error("Community name is already used by another group. Please choose a different name."))
            } else {
                resolve()
            }
        })
    })
}

const createCommunity = async (req, res) => {

    //get user_id of the community creator
    if (!req.session || !req.session.user) {
        return res.status(401).json("Login is required.")
    }
    const user_id = req.session.user.user_id

    try {
        //check uniqueness of the name of the community being created
        await checkUniqueName(req.body.community_name)

        //add a group entry to db
        const group_id = uuidv4()
        const qInsertGroup = "INSERT INTO \`Groups\` (group_id, group_name, group_description, photo) VALUE (?,?,?,?)"
        const groupValues = [group_id, req.body.community_name, req.body.bio, '/images/default/community/default-community-photo1.png']

        db.query(qInsertGroup, groupValues, (err, data) => {
            if (err) return res.status(500).json(err)

            const qInsertCommunity = "INSERT INTO Communities (community_id, created_by, visibility) VALUE (?, ?, ?)";
            const communityValues = [group_id, user_id, req.body.visibility]

            //add a community entry, referencing the group entry above, to db
            db.query(qInsertCommunity, communityValues, (err, data) => {
                if (err) return res.status(500).json(err)

                const qInsertCreator = "INSERT INTO MemberOf (group_id, user_id) VALUE (?, ?)"
                db.query(qInsertCreator, [group_id, user_id], (err) => {
                    if(err) return res.status(500).json(err)
                    return res.status(200).json(group_id)
                })
            })
        })
    } catch (err) {
        if (err.message === "Community name is already used by another group. Please choose a different name.") {
            return res.status(409).json(err.message)
        } else {
            return res.status(500).json(err)
        }
    }
}

module.exports = { createCommunity }