import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Typography } from "@mui/material";

import Accordion from "react-bootstrap/Accordion";
import 'bootstrap/dist/css/bootstrap.min.css';
import SidepanelItem from "../SidepanelItem/SidepanelItem";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import binocularsIcon from "../../images/binoculars.png";
import CommunityBrowser from "../../pages/CommunityBrowser/CommunityBrowser"
import ConnectionUpdatesContext from "../../context/ConnectionUpdatesContext";

import "./Sidepanel.css";

function ConnectionsSidepanel({ handleClickChat, currentUserId }) {

    const { connectionId } = useParams()

    const [pendingConnections, setPendingConnections] = useState([])
    const [activeConnections, setActiveConnections] = useState([])
    const [inactiveConnections, setInactiveConnections] = useState([])
    const [error, setError] = useState(null)
    const { updateConnections, setUpdateConnections } = useContext(ConnectionUpdatesContext)

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

    async function fetchLatestMessage(sender_id, receiver_id) {
        try {
            const res = await fetch(`/api/connections/chat/latest/${sender_id}/${receiver_id}`)
            const data = await res.json()

            if (data[0]) {
                return data[0]
            } else {
                return null
            }
        } catch (err) {
            // console.error(err)
        }
        return null
    }

    async function getPendingConnections() {
        try {
            const response = await fetch(`/api/connections`)
            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw {
                    message: "Failed to fetch pending connections", 
                    statusText: response.statusText,
                    status: response.status
                }
            }
            const data =  await response.json()
            
            // New array for message and timestamp
            const updatedConnections = [];
            for (const connection of data) {
                const otherUserId = (connection.userA_id === currentUserId) 
                    ? connection.userB_id 
                    : connection.userA_id
                const latestMessage = await fetchLatestMessage(currentUserId, otherUserId)
                updatedConnections.push({ ...connection, latestMessage: latestMessage?.message, latestTime: latestMessage?.timestamp})
            }

            setPendingConnections(updatedConnections)
        } catch (err) {
            // console.log(err)
            setError(err)
        }
    }

    async function getActiveConnections() {
        try {
            const response = await fetch(`/api/connections/active-connections/${connectionId}`)
            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw {
                    message: "Failed to fetch active connections", 
                    statusText: response.statusText,
                    status: response.status
                }
            }
            const data =  await response.json()

            const updatedConnections = [];
            for (const connection of data) {
                const otherUserId = (connection.userA_id === currentUserId) 
                    ? connection.userB_id 
                    : connection.userA_id
                const latestMessage = await fetchLatestMessage(currentUserId, otherUserId)
                updatedConnections.push({ ...connection, latestMessage: latestMessage?.message, latestTime: latestMessage?.timestamp})
            }

            setActiveConnections(updatedConnections)
        } catch (err) {
            // console.log(err)
            setError(err)
        }
    }

    async function getInactiveConnections() {
        try {
            const response = await fetch('/api/connections/inactive-connections')
            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw {
                    message: "Failed to fetch inactive connections", 
                    statusText: response.statusText,
                    status: response.status
                }
            }
            const data = await response.json()

            const updatedConnections = [];
            for (const connection of data) {
                const otherUserId = (connection.userA_id === currentUserId) 
                    ? connection.userB_id 
                    : connection.userA_id
                const latestMessage = await fetchLatestMessage(currentUserId, otherUserId)
                updatedConnections.push({ 
                    ...connection, 
                    latestMessage: latestMessage?.message, 
                    latestTime: latestMessage?.timestamp
                })
            }

            setInactiveConnections(updatedConnections)
        } catch (err) {
            // console.log(err)
            setError(err)
        }
    }

    async function fetchAllConnections() {
        await getPendingConnections()
        await getActiveConnections()
        await getInactiveConnections()
    }

    async function updateInactiveConnections() {
        try {
            const response = await fetch('/api/connections/update-inactive', {method: 'PUT'})
            if (response.status === 200) {
                console.log('Active connections updated to inactive')
            } else {
                console.log('Error updating active connections')
            }
            setUpdateConnections(true)
        } catch (err) {
            console.log(err)
        }
    }

    // Fetching pending/active/inactive connections
    useEffect(() => {
        // console.log('connections updates: ' + updateConnections)

        if(updateConnections) {
            fetchAllConnections()
        }

    }, [updateConnections])

    useEffect(() => {
        if (currentUserId) {
            fetchAllConnections()
        }
    }, [currentUserId])

    useEffect(() => {
        // Call the function to update inactive connections periodically
        const interval = setInterval(() => {
            updateInactiveConnections()
        }, 60 * 60 * 1000) // Check every hour
        
        return () => {
            clearInterval(interval)
        }
    }, [updateConnections])
    
    // Map over the pendingConnections
    const pendingConnectionsEl = pendingConnections.map((connection) => {
        return (
            <Link 
                to={`/connections/${connection.connection_id}`}
                key={connection.connection_id}
                state={{ 
                    sender_id: currentUserId,
                    receiver_name: connection.userA_id === currentUserId ? connection.userB_username : connection.userA_username, 
                    pendingConnections: pendingConnections
                }}
                onClick={() => handleClickChat({connectionId: connection.connection_id})}
            >
                <Accordion.Body style={{backgroundColor: '#11515c'}}>
                        <SidepanelItem
                            image={
                                connection.userA_id === currentUserId
                                    ? connection.userB_photo
                                    : connection.userA_photo
                            }
                            title={
                                connection.userA_id === currentUserId
                                ? connection.userB_username
                                : connection.userA_username
                            }
                            subtitle={connection.latestMessage ? connection.latestMessage : "No messages yet"}
                            indicator={connection.latestTime ? formatTimestampForDisplay(connection.latestTime) : ""}
                        />
                </Accordion.Body>
            </Link>
        )
    })

    // Map over activeConnections data return from backend
    const activeConnectionsEl = activeConnections.map((connection) => {
        return (
            <Link
                to={`/connections/${connection.connection_id}`}
                key={connection.connection_id}
                state={{ 
                    sender_id: currentUserId,
                    receiver_name: connection.userA_id === currentUserId ? connection.userB_username : connection.userA_username, 
                    pendingConnections: activeConnections
                }}
                onClick={() => handleClickChat({connectionId: connection.connection_id})}
            >
                <Accordion.Body style={{backgroundColor: '#11515c'}}>
                    <SidepanelItem 
                        image={connection.userA_id === currentUserId 
                            ? connection.userB_photo 
                            : connection.userA_photo
                        } 
                        title={ connection.userA_id === currentUserId
                            ? connection.userB_username
                            : connection.userA_username
                        } 
                        subtitle={connection.latestMessage ? connection.latestMessage : "No messages yet"}
                        indicator={connection.latestTime ? formatTimestampForDisplay(connection.latestTime) : ""}
                    />
                </Accordion.Body>
            </Link>
        )
    })

    // Map over inactiveConnections data return from backend
    const inactiveConnectionsEl = inactiveConnections.map((connection) => {
        return (
            <Link
                to={`/connections/${connection.connection_id}`}
                key={connection.connection_id}
                state={{ 
                    sender_id: currentUserId,
                    receiver_name: connection.userA_id === currentUserId ? connection.userB_username : connection.userA_username, 
                    pendingConnections: inactiveConnections,
                    isInactive: true
                }}
                onClick={() => handleClickChat({connectionId: connection.connection_id})}
                
            >
                <Accordion.Body key={connection.connection_id} style={{backgroundColor: '#11515c'}}>
                    <SidepanelItem 
                        image={connection.userA_id === currentUserId 
                            ? connection.userB_photo 
                            : connection.userA_photo
                        } 
                        title={ connection.userA_id === currentUserId
                            ? connection.userB_username
                            : connection.userA_username
                        } 
                        subtitle={connection.latestMessage ? connection.latestMessage : "No messages yet"}
                        indicator={connection.latestTime ? formatTimestampForDisplay(connection.latestTime) : ""}
                    />
                </Accordion.Body>
            </Link>
        )
    })

    if (error) {
        return <h4>There was an error: {error.message}</h4>
    }

    return (
        <div className="sidepanel-container">
            <div className="scroll-content">
                <Typography className="sidepanel-header" variant="h4" color="common.white" gutterBottom>
                    Connections
                </Typography>
                <Accordion flush style={{backgroundColor: '#11515c'}} defaultActiveKey="0">
                    <Accordion.Item style={{backgroundColor: '#11515c'}} eventKey="0">
                        <Accordion.Header style={{backgroundColor: '#11515c'}}>Active connections</Accordion.Header>
                            {activeConnectionsEl}
                    </Accordion.Item>
                </Accordion>
                <Accordion flush style={{backgroundColor: '#11515c'}} defaultActiveKey="0">
                    <Accordion.Item style={{backgroundColor: '#11515c'}} eventKey="0">
                        <Accordion.Header style={{backgroundColor: '#11515c'}}>Pending connections</Accordion.Header>
                            {pendingConnectionsEl}
                    </Accordion.Item>
                </Accordion>
                <Accordion flush style={{backgroundColor: '#11515c'}} defaultActiveKey="0">
                    <Accordion.Item style={{backgroundColor: '#11515c'}} eventKey="0">
                        <Accordion.Header style={{backgroundColor: '#11515c'}}>Inactive connections</Accordion.Header>
                        <Accordion.Body style={{backgroundColor: '#11515c'}}>
                            {inactiveConnectionsEl}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

            </div>
        </div>
    );
}

function GroupsSidepanel({ shouldUpdate, handleSwitchSubtabs, currentUserId }) {

    const [courseGroups, setCourseGroups] = useState([])
    const [communities, setCommunities] = useState([])
    const [communityBrowser, setCommunityBrowser] = useState(false)
    const [communityUpdates, setCommunityUpdates] = useState(false) // true --> fetch latest data and rerender


    useEffect(() => {
        async function getGroupsOfCourses() {
            try {
                const response = await fetch('/api/groups/courses')
                if (!response.ok) {
                    // eslint-disable-next-line no-throw-literal
                    throw {
                        message: "Failed to fetch courses in groups", 
                        statusText: response.statusText,
                        status: response.status
                    }
                }
                const data = await response.json()
                setCourseGroups(data)
            } catch(err) {
                // console.log(err)
            }
        }
        getGroupsOfCourses()
    }, [shouldUpdate])

    async function fetchCommunityInfo() {
        try {
            const response = await fetch('/api/community/joined')
            if (!response.ok) {
                // eslint-disable-next-line no-throw-literal
                throw {
                    message: "Failed to fetch community info", 
                    statusText: response.statusText,
                    status: response.status
                }
            }
            const data = await response.json()
            setCommunities(data)
            setCommunityUpdates(false)
        } catch (err) {
            // console.log(err)
        }
    }

    useEffect(() => {
        fetchCommunityInfo()
    }, [])

    useEffect(() => {
        if(communityUpdates) {
            fetchCommunityInfo()
        }
    }, [communityUpdates])

    const courseGroupsEl = courseGroups.map(group => {
        const moreThanOneMember = (group.num_members > 1) ? "members" : "member"

        return (
            <Link 
                to={`/groups/${group.group_id}`} 
                key={group.group_id}
                onClick={() => handleSwitchSubtabs({groupId: group.group_id, groupName: group.group_name, groupPic: group.photo})}
                state={{
                    user_id: currentUserId
                }}
            >
                <Accordion.Body style={{backgroundColor: '#11515c'}}>
                    <SidepanelItem 
                        image={group.photo}
                        title={group.group_name} 
                        subtitle={`${group.num_members} ${moreThanOneMember}`} 
                        indicator=""
                    />
                </Accordion.Body>
            </Link>
        )
    })
    
    const communitiesEl = communities.map(community => {
        const moreThanOneMember = (community.member_count > 1) ? "members" : "member"

        return (
            <Link 
                to={`/groups/${community.community_id}`} 
                key={community.community_id}
                onClick={() => handleSwitchSubtabs({groupId: community.community_id, groupName: community.group_name, groupPic: community.photo})}
                state={{
                    user_id: currentUserId
                }}
            >
                <Accordion.Body style={{backgroundColor: '#11515c'}}>
                    <SidepanelItem 
                        image={community.photo}
                        title={community.group_name}
                        subtitle={`${community.member_count} ${moreThanOneMember}`}
                        indicator=""
                        />
                </Accordion.Body>
            </Link>
        )
    })

    async function handleBrowseBtnClick() {
        setCommunityBrowser(true)
    }

    return (
        <div className="sidepanel-container">
            <div className="scroll-content">
                <Typography className="sidepanel-header" variant="h4" color="common.white" gutterBottom>
                    Groups
                </Typography>
                <Accordion flush style={{backgroundColor: '#11515c'}} defaultActiveKey="0">
                    <Accordion.Item style={{backgroundColor: '#11515c'}} eventKey="0">
                        <Accordion.Header style={{backgroundColor: '#11515c'}}>Courses</Accordion.Header>
                            {courseGroupsEl}
                    </Accordion.Item>
                </Accordion>
                <Accordion flush style={{backgroundColor: '#11515c'}} defaultActiveKey="0">
                    <Accordion.Item style={{backgroundColor: '#11515c'}} eventKey="0">
                        <Accordion.Header style={{backgroundColor: '#11515c'}}>Communities</Accordion.Header>
                            {communitiesEl}
                    </Accordion.Item>
                </Accordion>
            </div>
            <div className="nav-buttons">
                <button type="button" id="exploreBtn" onClick={handleBrowseBtnClick}><img src={binocularsIcon} alt="" /> Explore communities</button>
            </div>
            {communityBrowser && <CommunityBrowser notifyClosure={() => setCommunityBrowser(false)} notifyCommunityUpdate={() => setCommunityUpdates(true)} />}
        </div>
    )
}

function SettingsSidepanel() {
    const path = useLocation().pathname;

    function handleSettingsClick(event) {
        var items = document.querySelectorAll('.setting-item-div.active');

        if(items.length) 
            items[0].className = 'setting-item-div';

        event.target.className = 'setting-item-div active';
    }

    return (
        <div className="sidepanel-container">
            <div className="scroll-content">
                <Typography className="sidepanel-header" variant="h4" color="common.white" gutterBottom>
                    Settings
                </Typography>
                <Link to="/setting/edit-profile">
                    {(path === "/setting/edit-profile") ? 
                    <div className="setting-item-div active" onClick={handleSettingsClick} >Edit profile</div> : 
                    <div className="setting-item-div" onClick={handleSettingsClick} >Edit profile</div> 
                    }
                </Link>
                <Link to="/setting/change-password">
                    {(path === "/setting/change-password") ? 
                    <div className="setting-item-div active" onClick={handleSettingsClick} >Change password</div> : 
                    <div className="setting-item-div" onClick={handleSettingsClick} >Change password</div> 
                    }
                </Link>
                <Link to="/setting/edit-course-enrollment">
                    {(path === "/setting/edit-course-enrollment") ? 
                    <div className="setting-item-div active" onClick={handleSettingsClick} >Edit course enrollment</div> : 
                    <div className="setting-item-div" onClick={handleSettingsClick} >Edit course enrollment</div> 
                    }
                </Link>
                <Link to="/setting/delete-account">
                    {(path === "/setting/delete-account") ? 
                    <div className="setting-item-div active" onClick={handleSettingsClick} >Delete account</div> : 
                    <div className="setting-item-div" onClick={handleSettingsClick} >Delete account</div> 
                    }
                </Link>
                <Link to="/setting/logout">
                    {(path === "/setting/logout") ? 
                    <div className="setting-item-div active" onClick={handleSettingsClick} >Logout</div> : 
                    <div className="setting-item-div" onClick={handleSettingsClick} >Logout</div> 
                    }
                </Link>
                
            </div>
        </div>
    )
}

export default function Sidepanel(props) {

    const [currentUserId, setCurrentUserId] = useState(null);
    
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
                // console.log(err)
            }
        }
        getCurrentLoginUser()
    }, [])

    return (
        <>
            {props.connections && <ConnectionsSidepanel handleClickChat={props.handleClickChat} currentUserId={currentUserId} />}
            {props.groups && <GroupsSidepanel shouldUpdate={props.shouldUpdate} handleSwitchSubtabs={props.handleSwitchSubtabs} currentUserId={currentUserId} />}
            {props.settings && <SettingsSidepanel />}
        </>
    );
}
