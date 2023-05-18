const db = require('../db/connection.db').pool

const getCommunities = (req,res) => {

    if (!req.session || !req.session.user) {
        return res.status(401).json("Login is required.")
    }
    const user_id = req.session.user.user_id
    
    const query = `SELECT c.community_id, g.group_name, g.group_description, g.photo 
                    FROM Communities c 
                    INNER JOIN \`Groups\` g 
                    ON c.community_id = g.group_id 
                    LEFT JOIN MemberOf m 
                    ON c.community_id = m.group_id AND m.user_id = ? 
                    WHERE c.visibility = 'public' AND m.user_id IS NULL`

                    
    db.query(query, [user_id], (err,result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(409).json("There are no public communities to join.")
        return res.status(200).json(result)
    })
}


const joinCommunity = (req,res) => {
    //get username of the community creator
    if (!req.session || !req.session.user) {
        return res.status(401).json("Login is required.")
    }
    const user_id = req.session.user.user_id
    
    //join community
    const qJoinGroup = "INSERT INTO MemberOf (group_id, user_id) VALUE (?,?)"
    db.query(qJoinGroup, [req.body.community_id, user_id], (err,data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Successfully joined community.")
    })
}

const getCommunityDetails = (req, res) => {
    const group_id = req.params.group_id
    const query = `
        SELECT *
        FROM \`Groups\` 
        WHERE group_id = ?`

    db.query(query, [group_id], (err, data) => {
        if (err) {
            // console.error(err)
            return res.status(500).json('Internal server error')
        }

        if (data.length === 0) {
            return res.status(404).json('Community not found')
        }

        res.status(200).json(data)
    })
}


module.exports = { getCommunities , joinCommunity, getCommunityDetails }