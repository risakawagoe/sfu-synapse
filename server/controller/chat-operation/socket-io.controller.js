const db = require("../../db/connection.db").pool

const socketController = (io) => {
    // Create a mapping of user IDs to their corresponding socket IDs
    const userIdToSocketId = new Map()

    // Socketio Server listens for "connection" event
    io.on("connection", (socket) => {

        // Direct Message
        socket.on("joinConnection", (userId) => {
            // console.log("User joined with connectionId: ", userId)
            // Save the mapping of the user's ID to their socket ID
            userIdToSocketId.set(userId, socket.id);
        })

        // Listen for "sendDirectMessage" event from client
        socket.on('sendDirectMessage', ( { sender_id, receiver_id, message, timestamp} ) => {
            const newMessage = {
                sender_id,
                receiver_id,
                message,
                timestamp
            }
            // console.log("Sending to: ", receiver_id)

            // Save the message to the database
            const insertQuery = 'INSERT INTO DirectMessages SET ?'
            db.query(insertQuery, newMessage, (err, data) => {
                if (err) {
                    // console.log(err)
                } else {
                    // console.log('Message saved to the database')
                }       
            })

            // Emit the message to the receiver
            const receiverSocketId = userIdToSocketId.get(receiver_id)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveDirectMessage', newMessage)
            }
        })

        // Group Message
        socket.on("joinGroup", (groupId) => {
            // console.log("User join group:", groupId )
            socket.join(groupId)
        })

        socket.on('sendGroupMessage', ({ user_id, group_id, message, timestamp }) => {
            const newGroupMessage = {
                user_id,
                group_id,
                message,
                timestamp
            }

            const insertQuery = 'INSERT INTO GroupMessages SET ?'
            db.query(insertQuery, newGroupMessage, (err, data) => {
                if (err) {
                    // console.log(err)
                } else {
                    // console.log('Group message saved to the database')
                }       
            })

            // Emit the message to the all clients in the group
            io.to(group_id).emit('receiveGroupMessage', newGroupMessage)
        })

        socket.on("disconnect", () => {
            // console.log("User Disconnect", socket.id)
        })
    })
}

module.exports = socketController