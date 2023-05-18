import React, { useState, useEffect, useContext } from 'react'
import { useParams, useLocation, useOutletContext } from 'react-router-dom';
import { Typography, Box, Divider, Paper, InputBase, IconButton } from "@mui/material";
import Avatar from '@mui/joy/Avatar';
import SendIcon from '@mui/icons-material/Send';
import ChatTopBar from "../../components/ChatTopBar/ChatTopBar";
import ConnectionUpdatesContext from "../../context/ConnectionUpdatesContext";

import './Chat.css'

export default function Chat() {
    const { updateConnections, setUpdateConnections } = useContext(ConnectionUpdatesContext)

    // Data from connectionLayout and groupLayout
    const { socketForConnection, socketForGroup } = useOutletContext()

    const { connectionId } = useParams()
    const { groupId } = useParams()

    // state value from sidepanel.jsx
    const location = useLocation()
    const currentUserId = location?.state?.sender_id || location?.state?.user_id
    const connectionObj = location.state?.pendingConnections?.find(connection => {
        return connection.connection_id === connectionId
    })

    const isInactive = location?.state?.isInactive
    
    const [input, setInput] = useState("")
    const [messageList, setMessageList] = useState([])
    const [groupMessageList, setGroupMessageList] = useState([])
    const [userDetails, setUserDetails] = useState({})
    const [groupMembers, setGroupMembers] = useState([])
    const timestamp = new Date(Date.now());
    const [init, setInit] = useState(0) // used for scroll position control

    function formatTimestamp(date) {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    function formatTimestampForDisplay(timestamp) {
        const date = new Date(timestamp);
        const hours24 = date.getHours();
        const ampm = hours24 < 12 ? "AM" : "PM";
        const hours12 = hours24 % 12 || 12;
        const minutes = date.getMinutes();
        const formattedHours = hours12.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    async function fetchUserDetails(userId) {
        try {
            const res = await fetch(`/api/userDetails/${userId}`);
            const data = await res.json();
            setUserDetails((prevUserDetails) => ({
                ...prevUserDetails,
                [userId]: data,
            }));
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchGroupMembers() {
        try {
            const res = await fetch(`/api/group-members/${groupId}`);
            const data = await res.json();
            setGroupMembers(data);
        } catch (err) {
            console.error(err);
        }
    }

    // Update the pending connection to be active 
    async function handleUpdateConnection(connectionId) {
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connection_id: connectionId }),
        }
        
        try {
            const response = await fetch(`/api/connections/active-connections/${connectionId}`, options)
            if (response.status === 200) {
                setUpdateConnections(true)
            }
            return response
        } catch (err) {
            console.log(err)
        }
    }

    // Update inactive connection to be active again
    async function updateInactiveToActive(connection_id) {
        try {
            const response = await fetch('/api/connections/update-active', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ connection_id: connection_id })
            })
            if (response.status === 200) {
                console.log('Inactive connections updated to active')
            } else {
                console.log('Error updating inactive connections')
            }
            setUpdateConnections(true)
        } catch (err) {
            console.log(err)
        }
    }

    function handleInputChange(e) {
        setInput(e.target.value)
    }

    function sendMessage(e) {
        e.preventDefault()

        // Direct message
        if (connectionId && input !== "") {
            const messageData = {
                sender_id: currentUserId,
                receiver_id: (currentUserId === connectionObj.userA_id) 
                            ? connectionObj.userB_id 
                            : connectionObj.userA_id,
                message: input,
                timestamp: formatTimestamp(timestamp)
            }
    
            socketForConnection?.emit('sendDirectMessage', messageData)
            
            // Update the messageList state with the sent message
            setMessageList((prevMessages) => [...prevMessages, {
                ...messageData,
                timestamp: timestamp, // Use the Date object for display
            }]);

        }

        // Group Message
        if (groupId && input !== "") {
            const groupMessageData = {
                user_id: currentUserId,
                group_id: groupId,
                message: input,
                timestamp: formatTimestamp(timestamp)
            }

            socketForGroup?.emit('sendGroupMessage', groupMessageData)
        }

        // Clear the input after sent
        setInput("")

        // update the state in sidepanel.jsx
        setUpdateConnections(true)

        if (isInactive) {
            console.log(connectionObj.connection_id)
            updateInactiveToActive(connectionObj.connection_id)
        }
    }

    useEffect(() => {
        // Direct message
        if (connectionId) {
            async function fetchDMChatHistory() {
                const sender_id = connectionObj.userA_id;
                const receiver_id = connectionObj.userB_id;
            
                try {
                    setInit(true)
                    const res = await fetch(`/api/connections/chat/${sender_id}/${receiver_id}`);
                    const data = await res.json();
                    setMessageList(data);
    
                    // Check if there is at least one message from the receiver
                    const messagesFromReceiver = data.filter((message) => message.sender_id === receiver_id)
                    if (messagesFromReceiver.length > 0 && connectionObj.status === "pending") {
                        const response = await handleUpdateConnection(connectionObj.connection_id)
                        if (response.ok) {
                            console.log("Connection status updated to Active")
                        } else {
                            console.log("Error updating connection status")
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            fetchDMChatHistory()

            // GET details of current user and the other user
            fetchUserDetails(connectionObj.userA_id)
            fetchUserDetails(connectionObj.userB_id)

             // Join connection with the current user's ID
            socketForConnection?.emit('joinConnection', currentUserId);

            socketForConnection?.on("receiveDirectMessage", (message) => {
                setMessageList((prevMessages) => [...prevMessages, {
                    ...message,
                    timestamp: timestamp
                }])
                setUpdateConnections(true)

                if (isInactive) {
                    console.log("updated ")
                    updateInactiveToActive(connectionObj.connection_id)
                }
            })

            // Clean up the event listener
            return () => {
                socketForConnection?.off("receiveDirectMessage")
            }

        }

        // Group message
        if (groupId) {
            const user_id = currentUserId
            const group_id = groupId

            async function fecthGroupChatHistory() {
                try {
                    setInit(true)
                    const response = await fetch(`/api/groups/chat/${user_id}/${group_id}`)
                    const data = await response.json()
                    setGroupMessageList(data)
                } catch (err) {
                    console.log(err)
                }
            }
            fecthGroupChatHistory()

            fetchGroupMembers()

            socketForGroup?.emit('joinGroup', groupId)

            socketForGroup?.on("receiveGroupMessage", (message) => {
                setGroupMessageList((prevGroupMessages) => [...prevGroupMessages, {
                    ...message,
                    timestamp: timestamp
                }])
                setUpdateConnections(true)
            })

            // Clean up the event listener
            return () => {
                socketForGroup?.off("receiveGroupMessage")
            }

        }

    }, [connectionId, groupId, socketForConnection, socketForGroup])

    useEffect(() => {    
        // Fetch user details for all group members
        if (groupMembers.length > 0) {
            groupMembers.forEach((member) => {
                fetchUserDetails(member.user_id)
            })
        }
    }, [groupMembers])

    const messagesEl = messageList.map((messageContent, index) => {
        // GET users' name and photo
        const senderUser = userDetails[messageContent.sender_id]
        const senderUsername = senderUser?.username || ''
        const senderProfilePic = senderUser?.photo || ''

        return (
            <div className="chat-content" key={index}>
                <Avatar src={senderProfilePic} alt="user icon" className="user-icon"/>
                <div>
                    <Box sx={{ fontWeight: 'bold' }}>
                        <Typography variant="body1">
                            {senderUsername}
                        </Typography>
                    </Box>
                    <Typography variant="body3">
                        {messageContent.message}
                    </Typography>
                </div>
                <div className="chat-time">
                    <Typography variant="body1">
                        {formatTimestampForDisplay(messageContent.timestamp)}
                    </Typography>
                </div>
            </div>
        )
    })

    const groupMessagesEl = groupMessageList.map((messageContent, index) => {
        const senderUser = userDetails[messageContent.user_id]
        const senderUsername = senderUser?.username || ''
        const senderProfilePic = senderUser?.photo || ''

        return (
            <div className="chat-content" key={index}>
                <Avatar src={senderProfilePic} alt="user icon" className="user-icon"/>
                <div>
                    <Box sx={{ fontWeight: 'bold' }}>
                        <Typography variant="body1">
                            {senderUsername}
                        </Typography>
                    </Box>
                    <Typography variant="body3">
                        {messageContent.message}
                    </Typography>
                </div>
                <div className="chat-time">
                    <Typography variant="body1">
                        {formatTimestampForDisplay(messageContent.timestamp)}
                    </Typography>
                </div>
            </div>
        )
    })

    // adjust scrollbar
    useEffect(() => {
        const chatList = document.querySelector('div.chat-content-container')
        const offset = 500
        // console.log(chatList.scrollHeight - chatList.scrollTop, chatList.clientHeight + offset)

        if(init || chatList.scrollHeight - chatList.scrollTop < chatList.clientHeight + offset) {
            chatList.scrollTo(0, chatList.scrollHeight)
            setInit(false)
        }
    }, [groupMessageList, messageList])


    return (
        <>  
            <ChatTopBar />

            <div className="chat-content-container">
                {connectionId ? messagesEl : groupMessagesEl}
            </div>

            <Divider />
            <Paper component="form" onSubmit={sendMessage} className="input-container">
                <InputBase 
                    className="input-field"
                    placeholder="Type a message"
                    value={input}
                    onChange={handleInputChange}>
                </InputBase>
                <IconButton type="submit">
                    <SendIcon className="send-button"/>
                </IconButton>
            </Paper>
        </>
    )
}