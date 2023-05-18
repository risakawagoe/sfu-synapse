import React, { useState, useEffect } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { Divider, Paper, InputBase, IconButton } from "@mui/material";
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import ChatTopBar from "../../components/ChatTopBar/ChatTopBar";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import settingLogo from "../../images/settings.svg"

import './Discover.css'

export default function Discover() {

    // Data from groupLayout
    const { socketForGroup } = useOutletContext()
    
    const { groupId } = useParams()

    const timestamp = new Date(Date.now())

    // ProfileCard is selected
    const [isSelected, setIsSelected] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [currentReceiverId, setCurrentReceiverId] = useState(null)
    const [currentReceiverFirstName, setCurrentReceiverFirstName] = useState(null)
    const [input, setInput] = useState("")
    const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false)

    function formatTimestamp(date) {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    function handleSelectUser(receiverId, firstName) {
        setIsSelected(true)
        setCurrentReceiverId(receiverId)
        setCurrentReceiverFirstName(firstName)
    }

    function handleInputChange(e) {
        const { value } = e.target
        setInput(value)
    }

    useEffect(() => {
        async function getCurrentLoginUser() {
            try {
                const response = await fetch("/api/currentuser")
                if (!response.ok) {
                    // eslint-disable-next-line no-throw-literal
                    throw {
                        message: "Failed to fetch current login user", 
                        statusText: response.statusText,
                        status: response.status
                    }
                }
                const data =  await response.json()
                setCurrentUserId(data[0].user_id)
            } catch (err) {
                console.log(err)
            }
        }
        getCurrentLoginUser()
    }, [])

    useEffect(() => {
        // Join connection with the current user's ID
        socketForGroup?.emit('joinConnection', currentUserId)

        socketForGroup?.on("receiveDirectMessage", (message) => {
            console.log(message)
        })
    }, [currentUserId])

    async function createPendingConnection() {
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender_id: currentUserId,
                    receiver_id: currentReceiverId
                })
            }

            const response = await fetch("/api/connections", options)
            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw {
                    message: "Failed to create pending connection",
                    statusText: response.statusText,
                    status: response.status,
                    }
                }

            const data = await response.json()
            
        } catch (err) {
            console.log(err)
        }
    }

    async function sendMessage(e) {
        e.preventDefault()

        if (input !== "") {
            const messageData = {
                sender_id: currentUserId,
                receiver_id: currentReceiverId,
                message: input,
                timestamp: formatTimestamp(timestamp)
            }

            if (!hasSentFirstMessage) {
                const response = await fetch(`/api/connections/check-pending/${currentUserId}/4`)
                const data = await response.json()

                // Create pending connections if nonw exists
                if (data.length === 0) {
                    await createPendingConnection()
                }

                setHasSentFirstMessage(true)
            }

            socketForGroup?.emit('sendDirectMessage', messageData)
        }

        // Clear the input and set back the selected state
        setInput("")
        setIsSelected(false)
    }

    return (
        <>
            <ChatTopBar />

            <div className="profile-cards-layout">
                <div className="profile-cards-container">
                    <Link 
                        to={`/groups/${groupId}/discover`}
                        onClick={() => setIsSelected(true)}
                    >
                        <ProfileCard onSelectUser={handleSelectUser}/>
                    </Link>
                </div>
            </div>
            <Divider />
            <Paper component="form" onSubmit={sendMessage} className="input-container">
                <InputBase
                    className="input-field"
                    disabled={isSelected ? false : true}
                    value={input}
                    onChange={handleInputChange}
                    placeholder={`Message to ${currentReceiverFirstName}...`}>
                </InputBase>
                <IconButton type="submit" disabled={isSelected ? false : true}>
                    <GroupAddIcon className="send-button"/>
                </IconButton>
            </Paper>
        </>
    )
}