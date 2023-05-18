import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { IconButton, Dialog, DialogTitle, Divider,
    DialogContent, Avatar, Card, CardHeader, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ConnectionUpdatesContext from "../../context/ConnectionUpdatesContext";

import tempPic from "../../images/default_profile_picture.png"
import arrow from "../../images/connected-arrows.png"

import "./Disconnect.css"

export default function Disconnect() {

    const { updateConnections, setUpdateConnections } = useContext(ConnectionUpdatesContext)

    const { connectionId } = useParams()
    const path = useLocation().pathname
    const nagivate = useNavigate()

    const [openPopup, setOpenPopup] = useState(false)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [deleteUser, setDeleteUser] = useState([])

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
        if(path === `/connections/${connectionId}/settings`) {
            setOpenPopup(true)
        }
    },[connectionId, path])

    function handlePopupClose() {
        setOpenPopup(false);
        nagivate(`/connections`, {replace: true})
    };

    // GET the exising connection 
    useEffect(() => {
        async function currentConnection() {
            try {
                const response = await fetch(`/api/connections/disconnect/${connectionId}`)
                if (!response.ok) {
                    // eslint-disable-next-line no-throw-literal
                    throw {
                        message: "Failed to get current connection", 
                        statusText: response.statusText,
                        status: response.status
                    }
                }
                const data =  await response.json()
                setDeleteUser(data[0])
            } catch (err) {
                console.log(err)
            }
        }
        currentConnection()
    },[])


    // DELETE request
    async function removeConnection() {
        try {
            const response = await fetch(`/api/connections/${connectionId}/settings`, {method: "DELETE"})
            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw {
                    message: "Failed to delete connection", 
                    statusText: response.statusText,
                    status: response.status
                }
            }
            const data =  await response.json()
            console.log("Disconnect successfully with Id:", connectionId)
            if (data){
                alert(`Successfully disconnect with ${deleteUser.userA_id === currentUserId 
                    ? deleteUser.userB_username 
                    : deleteUser.userA_username}`)
                setUpdateConnections(true)
            }
            nagivate("/connections", {replace: true})
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <Dialog open={openPopup} PaperProps={{
            style: {
                width: "600px",
                borderRadius: "30px",
                overflow: "hidden",
            },
        }}>
            <DialogTitle className="pop-up-title-container">
                Connection settings
                <IconButton onClick={handlePopupClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent className="pop-up-content-container">
                <div className="pop-up-content">
                    <Card className="dialog-card">
                        <CardHeader avatar={
                            <Avatar alt="User A profile pic" src={`${deleteUser.userA_id === currentUserId 
                                ? deleteUser.userA_photo
                                : deleteUser.userB_photo}`} />
                        }
                        title={deleteUser.userA_id === currentUserId 
                            ? (`${deleteUser.userA_first_name} ${deleteUser.userA_last_name}`)
                            : (`${deleteUser.userB_first_name} ${deleteUser.userB_last_name}`)}
                        subheader={deleteUser.userA_id === currentUserId 
                            ? deleteUser.userA_username
                            : deleteUser.userB_username}
                    />
                    </Card>
                    <div className={
                            deleteUser.status === 'inactive'
                                ? 'inactive-arrow'
                                : deleteUser.status === 'pending'
                                ? 'pending-arrow'
                                : deleteUser.status === 'active'
                                ? 'active-arrow'
                                : ''
                            }>
                        <img alt="arrow" src={arrow} />
                        <Typography 
                            variant="body2" 
                            className={
                                deleteUser.status === 'inactive'
                                    ? 'inactive-connection'
                                    : deleteUser.status === 'pending'
                                    ? 'pending-connection'
                                    : deleteUser.status === 'active'
                                    ? 'active-connection'
                                    : ''
                            }>{deleteUser.status === 'pending' 
                                ? "pending" 
                                : deleteUser.status === 'inactive'
                                ? "inactive"
                                : deleteUser.status === 'active'
                                ? "active"
                                : ""}
                        </Typography>
                    </div>
                    <Card className="dialog-card">
                        <CardHeader avatar={
                            <Avatar alt="User B profile pic"  src={`${deleteUser.userA_id === currentUserId 
                                ? deleteUser.userB_photo
                                : deleteUser.userA_photo}`} />
                        }
                        title={deleteUser.userA_id === currentUserId 
                            ? (`${deleteUser.userB_first_name} ${deleteUser.userB_last_name}`)
                            : (`${deleteUser.userA_first_name} ${deleteUser.userA_last_name}`)}
                        subheader={deleteUser.userA_id === currentUserId 
                            ? deleteUser.userB_username
                            : deleteUser.userA_username}
                    />
                    </Card>
                </div>
                <div className="disconnect-prompt">
                    <Typography variant="body2" component="div">
                        {`Would you like to disconnect with ${deleteUser.userA_id === currentUserId 
                            ? deleteUser.userB_username 
                            : deleteUser.userA_username}`}
                    </Typography>
                    <button onClick={removeConnection}>
                        Disconnect
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}