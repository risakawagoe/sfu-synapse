import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import Sidepanel from "../Sidepanel/Sidepanel";
import Notification from "../Notification/Notification"
import ConnectionUpdatesContext from "../../context/ConnectionUpdatesContext";

import './ConnectionsLayout.css'
        
export default function ConnectionsLayout() {
    const path = useLocation().pathname

    // socketRef from MainLayout.jsx
    const { socket } = useOutletContext()

    const [onChatTab, setOnChatTab] = useState(false)
    const [connectionId, setConnectionId] = useState(null);
    const [updateConnections, setUpdateConnections] = useState(false)

    const handleClickChat = ({ connectionId }) => {
        setConnectionId(connectionId)
    }

    useEffect(() => {
        if (path === `/connections/${connectionId}` || path === `/connections/${connectionId}/settings`) {
            setOnChatTab(true)
        } else {
            setOnChatTab(false)
        }
    }, [path, connectionId])

    return (
        <ConnectionUpdatesContext.Provider value={{ updateConnections, setUpdateConnections }}>
            <Sidepanel connections handleClickChat={handleClickChat} />
            {onChatTab ? (
                <div className="connection-container">
                    <Outlet context={{from: path, socketForConnection: socket}}/>
                </div>
            ) : (
                <Notification />
            )}
        </ConnectionUpdatesContext.Provider>
        
    )
}