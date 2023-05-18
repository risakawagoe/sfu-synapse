const db = require("../db/connection.db").pool
const { v4: uuidv4 } = require('uuid');

// create Pending connetion: Sender sends a msg to a receiver
const createPendingConnection = (req, res) => {

    const { sender_id, receiver_id } = req.body

    const insertQuery = "INSERT INTO Connections (connection_id, userA_id, userB_id, Status) VALUES (?, ?, ?, ?)"

    db.query(insertQuery, [uuidv4(), sender_id, receiver_id, "pending"], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            res.status(200).json("Connection created successfully")
        }
    })
}

const getPendingConnections = (req, res) => {

    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const userId = req.session.user.user_id

    // GET data with the login user 
    // JOIN Connections table with Users table
    const query = `SELECT c.connection_id, c.status, 
                        c.userA_id, c.userB_id,
                        ua.username AS userA_username, 
                        ub.username AS userB_username, 
                        ua.photo AS userA_photo, 
                        ub.photo AS userB_photo
                    FROM Connections c 
                    JOIN Users ua ON c.userA_id = ua.user_id 
                    JOIN Users ub ON c.userB_id = ub.user_id
                    WHERE c.status = 'pending'
                    AND (c.userA_id = ? OR c.userB_id = ?)`

    db.query(query, [userId, userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {

            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No pending connections found")
                res.status(404).json("No pending connections found")
            }
        }
    })
}

const checkExistingPending = (req, res) => {
    const { sender_id, receiver_id } = req.params

    const query = ` SELECT * FROM Connections
                WHERE (userA_id = ? AND userB_id = ?)
                OR (userA_id = ? AND userB_id = ?)
                AND status = 'pending'`

    db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                res.status(404).json("No exist pending connections found")
            }
        }
    })
}

// update Pending connection to be Active: Receiver replies to the sender
const updatePendingToActive = (req, res) => {
    const { connection_id } = req.body

    // Check if the conection exists and the status is Pending
    const selectQuery = "SELECT * FROM Connections WHERE connection_id = ? AND status = 'pending'"

    db.query(selectQuery, [connection_id], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (!data || data.length === 0) {
                res.status(404).json("Connection not found")
            } else {
                
                // Pending conection exists and update it to be Active
                const updateQuery = "UPDATE Connections SET status = ? WHERE connection_id = ?"
                db.query(updateQuery, ["active", connection_id], (err, data) => {
                    if (err) {
                        // console.log(err)
                        res.status(500).json("Internal server error")
                    } else {
                        res.status(200).json(data)
                    }
                })
            }
        }
    })
}

const getActiveConnections = (req, res) => {

    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const userId = req.session.user.user_id

    const query = `SELECT c.connection_id, c.status, 
                        c.userA_id, c.userB_id,
                        ua.username AS userA_username, 
                        ub.username AS userB_username,
                        ua.photo AS userA_photo, 
                        ub.photo AS userB_photo
                    FROM Connections c 
                    JOIN Users ua ON c.userA_id = ua.user_id 
                    JOIN Users ub ON c.userB_id = ub.user_id
                    WHERE c.status = 'active'
                    AND (c.userA_id = ? OR c.userB_id = ?)`

    db.query(query, [userId, userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {

            if (data || data.length > 0) {
                res.status(200).json(data)
            } else { 
                // console.log("No active connections found")
                res.status(404).json("No active connections found")
            }
        }
    })
}

const getInactiveConnections = (req, res) => {

    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const userId = req.session.user.user_id

    const selectQuery = `SELECT c.connection_id, c.status, 
                            c.userA_id, c.userB_id,
                            ua.username AS userA_username, 
                            ub.username AS userB_username, 
                            ua.photo AS userA_photo, 
                            ub.photo AS userB_photo
                        FROM Connections c 
                        JOIN Users ua ON c.userA_id = ua.user_id 
                        JOIN Users ub ON c.userB_id = ub.user_id
                        WHERE c.status = 'inactive'
                        AND (c.userA_id = ? OR c.userB_id = ?)`

    db.query(selectQuery, [userId, userId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0){
                res.status(200).json(data)
            } else {
                // console.log("No inactive connections found")
                res.status(404).json("No inactive connections found")
            }
        }
    })
}

const getExistingConnection = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }

    const userId = req.session.user.user_id
    const connectionId = req.params.connectionId

    const selectQuery = `SELECT c.connection_id, c.status, 
                            c.userA_id, c.userB_id,
                            ua.first_name AS userA_first_name, ua.last_name AS userA_last_name,
                            ub.first_name AS userB_first_name, ub.last_name AS userB_last_name,
                            ua.username AS userA_username, 
                            ub.username AS userB_username, 
                            ua.photo AS userA_photo, 
                            ub.photo AS userB_photo
                        FROM Connections c 
                        JOIN Users ua ON c.userA_id = ua.user_id 
                        JOIN Users ub ON c.userB_id = ub.user_id
                        WHERE (c.status = 'active' OR c.status = 'pending' OR c.status = 'inactive')
                        AND (c.userA_id = ? OR c.userB_id = ?)
                        AND c.connection_id = ?`

    db.query(selectQuery, [userId, userId, connectionId], (err, data) => {
        if (err) {
            // console.log(err)
            res.status(500).json("Internal server error")
        } else {
            if (data || data.length > 0){
                res.status(200).json(data)
            } else {
                // console.log("No existing connections found")
                res.status(404).json("No existing connections found")
            }
        }
    })
}

const endConnection = (req,res) => {
    const connectionId = req.params.connectionId;
    const qDisconnect = "DELETE FROM Connections WHERE connection_id = ?"
    db.query(qDisconnect, [connectionId], (err,result) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json("Disconnected successfully.")
    })
}

// get user_id of all users that the current user has active connections with
function getConnectionWithStatus(userId, status) {
    const qGetConnections = `SELECT userA_id AS user_id
                                    FROM Connections
                                    WHERE userB_id = ? AND status=?
                                    UNION 
                                    SELECT userB_id AS user_id
                                    FROM Connections
                                    WHERE userA_id = ? AND status=?`
    return new Promise((resolve, reject) => {
        db.query(qGetConnections, [userId, status, userId, status], (err, data) => {
            if(err) reject(err)
            resolve(data)
        })
    })
}

async function updateStatusInDb(userId, otherUserId, status) {
    const qUpdateStatus = `UPDATE Connections SET status = ? 
                            WHERE (userA_id = ? AND userB_id = ?) OR (userB_id = ? AND userA_id = ?)`
    return new Promise((resolve, reject) => {
        db.query(qUpdateStatus, [status, userId, otherUserId, otherUserId, userId], (err, data) => {
            if(err) reject(err)
            resolve(`The connection between '${userId}' and '${otherUserId}' has been updated to '${status}'.`)
        })
    })
}
async function updateInactiveStatusToActive(connection_id, status) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE Connections SET status = ? WHERE connection_id = ?'
        db.query(query, [status, connection_id], (err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
    })
}

function getLastChat(userId, otherUserId) {
    const qGetLastChat = `SELECT timestamp FROM DirectMessages
                            WHERE sender_id = ? AND receiver_id = ?
                            ORDER BY id DESC
                            LIMIT 1`
    return new Promise((resolve, reject) => {
        db.query(qGetLastChat, [userId, otherUserId], (err, data) => {
            if(err) reject(err)
            resolve(data)
        })
    })
}

const updateActiveToInactive = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id

    try {
        const activeConnections = await getConnectionWithStatus(userId, 'active')
        const four_months = 175200 //in minutes

        // for all the users that the current user has active connections with,
        for (let i=0; i<activeConnections.length; i++) {
            let lastChatSent = await getLastChat(userId, activeConnections[i].user_id)
            let lastChatReceived = await getLastChat(activeConnections[i].user_id, userId)

            /*if (lastChatSent.length === 0) {
                let timeDiffInSec = (Math.abs(lastChatReceived[0].timestamp.getTime() - Date.now().getTime())) / 1000
                let timeDiffInMin = timeDiffInSec / 60
                if (timeDiffInMin >= four_months) {
                    setToInactiveInDb(userId, activeConnections[i].user_id)
                }
            } else if (lastChatReceived.length === 0) {
                let timeDiffInSec = (Math.abs(lastChatSent[0].timestamp.getTime() - Date.now().getTime())) / 1000
                let timeDiffInMin = timeDiffInSec / 60
                if (timeDiffInMin >= four_months) {
                    setToInactiveInDb(userId, activeConnections[i].user_id)
                }
            } else {
            */
                let mostRecentChatTimestamp;
                if (lastChatSent.length === 0 && lastChatReceived.length === 0) {
                    continue
                } else if (lastChatSent.length === 0) {
                    mostRecentChatTimestamp = lastChatReceived[0].timestamp
                } else if (lastChatReceived.length === 0) {
                    mostRecentChatTimestamp = lastChatSent[0].timestamp
                } else {
                    mostRecentChatTimestamp = new Date(Math.max(lastChatSent[0].timestamp, lastChatReceived[0].timestamp))
                }
                let timeDiffInSec = (Math.abs(mostRecentChatTimestamp.getTime() - Date.now())) / 1000
                let timeDiffInMin = timeDiffInSec / 60
                if (timeDiffInMin >= four_months) {
                    const response = await updateStatusInDb(userId, activeConnections[i].user_id, 'inactive')
                    // console.log(response)
                }
        }
        res.status(200).json("Made all necessary updates to the status of the user's connections.")
    } catch(err) {
        res.status(500).json(err)
        return
    }
}

const updateInactiveToActive = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.sendStatus(401)
    }
    const userId = req.session.user.user_id
    const { connection_id } = req.body
    
    try {
        const result = await updateInactiveStatusToActive(connection_id, 'active')
        if (result) {
            res.status(200).json("Connection status updated to active.")
        } else {
            res.status(500).json("Error updating connection status.")
        }
    } catch (err) {
        res.status(500).json(err)
    }
}




module.exports = {
    getExistingConnection,
    createPendingConnection, 
    getPendingConnections, 
    checkExistingPending,
    updatePendingToActive, 
    getActiveConnections, 
    getInactiveConnections,
    updateActiveToInactive,
    updateInactiveToActive,
    endConnection
}