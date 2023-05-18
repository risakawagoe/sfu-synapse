import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"
import activeIcon from "../../images/active-connection-icon.png";
import pendingIcon from "../../images/pending-connection-icon.png";
import inactiveIcon from "../../images/inactive-connection-icon.png";

import crownIcon from "../../images/crown.png"
import privateIcon from "../../images/lock-color.png"

export default function Home() {
    const navigate = useNavigate()

    
    // data
    const [user, setUser] = useState({})
    const [connections, setConnections] = useState([])
    const [courses, setCourses] = useState([])
    const [communities, setCommunities] = useState([])

    // viewer
    const [viewerState, setViewerState] = useState(false)
    const [target, setTarget] = useState(null)
    const [idx, setIdx] = useState(-1)
    const [info, setInfo] = useState(null)

    useEffect(() => {
        async function init() {
            const semester = getYearAndTerm()
            const response = await fetch(`/api/home/${semester.year}/${semester.term}`)
            const data = await response.json()

            if(response.status !== 200) {
                return alert(data)
            }

            // console.log(data.user)
            // console.log(data.connections)
            // console.log(data.courses)
            // console.log(data.communities)

            setUser(data.user)
            setConnections(data.connections)
            setCourses(data.courses)
            setCommunities(data.communities)
        }

        init()

    }, [])

    useEffect(() => {
        if(target === null) return

        // get data adn store in info state
        async function fetchInfo() {
            const response = await fetch(`/api/home/info/${target.type}/${target.id}`)
            const data = await response.json()
    
            if(response.status !== 200) {
                alert(data)
                setTarget(null)
                setIdx(-1)
                return
            }
            // console.log(data)
            setInfo(data)
        }
        fetchInfo()
    }, [target])

    useEffect(() => {
        // console.log(info)
        if(info) setViewerState(true)
    }, [info])

    useEffect(() => {
        if(!viewerState) {
            setTarget(null)
            setInfo(null)
            setIdx(-1)
        }
    }, [viewerState])

    function navigateToSettings() {
        navigate('/setting/edit-profile')
    }

    function handleViewGroup(event) {
        const elm = event.target.parentElement.parentElement
        if(elm.dataset.groupType === 'community') {
            setIdx(elm.dataset.index)
        }
        setTarget({ id: elm.id, type: 'group' })
    }
    
    function handleViewUser(event) {
        setTarget({ id: event.target.parentElement.id, type: 'user' })
    }

    function getYearAndTerm() {
        const time = new Date()
        const year = time.getFullYear()
        const month = time.getMonth() + 1

        if(month < 5) {
            return { year: year, term: 'spring'}
        }else if(month < 9) {
            return { year: year, term: 'summer'}
        }else {
            return { year: year, term: 'fall'}
        }
    }




    // templates
    const ViewerWindow = () => {
        return (
            <div className="viewer">
                {cardTemplate()}
            </div>
        )
    }

    const renderGroup = (list, heading) => {
        return (
            <>
                <h5>{heading}</h5>
                <ul className="listing">
                    {list.map(group => (
                        <li>
                            <img src={group.photo} alt="" />
                            <div>
                                <p className="name">{group.group_name}</p>
                                <p>{group.group_description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </>
        )
    }
    
    const renderMembers = (list) => {
        return (
            <>
                <h5>Members</h5>
                <ul className="listing">
                    {list.map(member => (
                        <li>
                            <img src={member.photo} alt="" />
                            <div>
                                <p className="name">{member.first_name} {member.last_name}</p>
                                <p>{member.username}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </>
        )
    }


    const cardTemplate = () => {
        return (
            <div className={`card ${idx !== -1 && (communities[idx].created_by === user.user_id || communities[idx].visibility === 'private') ? 'display-status-icon': ''}`}>
                <div id="closeBtn" onClick={() => setViewerState(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </div>
                <div className={`banner ${'random-bg' + (Math.floor(Math.random() * 10) + 1)}`}>
                    <img src={info.fullProfile.photo} alt="" />
                </div>
                <div className="status-icon-area">
                    {target.type === 'group' && idx !== -1 && communities[idx].created_by === user.user_id && <img className="status-icon-img" src={crownIcon} alt="" />}
                    {target.type === 'group' && idx !== -1 && communities[idx].visibility === 'private' && <img className="status-icon-img" src={privateIcon} alt="" />}
                </div>
                <h2 className="name">
                    {target.type === 'user' && (info.fullProfile.first_name + ' ' + info.fullProfile.last_name)}
                    {target.type === 'group' && info.fullProfile.group_name}
                </h2>
                <div className="title">
                    {target.type === 'user' && info.fullProfile.username}
                    {target.type === 'group' && (info.memberCount + ' members')}
                </div>
                <div className="desc">
                    {target.type === 'user' && info.fullProfile.bio}
                    {target.type === 'group' && info.fullProfile.group_description}
                </div>
                {target.type === 'user' && 
                    <div className="desc">
                        {info.courseHistory.length > 0 && renderGroup(info.courseHistory, 'Courses')}
                        {info.communities.length > 0 && renderGroup(info.communities, 'Communities')}
                    </div>
                }
                {target.type === 'group' && 
                    <div className="desc">
                        {info.memberList.length > 0 && renderMembers(info.memberList)}
                    </div>
                }
            </div>
        )
    }



    return (
        <div className="home">
            <h2>Dashboard</h2>
            <div className="dashboard">
                <section className="user-info pannel">
                    <section className="profile">
                        <div className="profile-summary">
                            <img src={user.photo} alt="" />
                            <div>
                                <p id="name">{user.first_name} {user.last_name}</p>
                                <p id="username">{user.username}</p>
                            </div>
                        </div>
                        <button type="button" className="btn" onClick={navigateToSettings}>Edit profile</button>
                    </section>
                    {user.bio && <p id="bio">{user.bio}</p>}
                </section>
                <section className="connections pannel">
                    <h3>Connections</h3>
                    <section className="active-connections">
                        <h5 className="active"><img src={activeIcon} className="colored-connection-icon" alt="" /> Active</h5>
                        <ul>
                            {connections.filter((item) => {
                                return item.status === 'active'
                            }).map((item) => (
                                <li id={item.user_id} key={item.username}>
                                    <div className="summary">
                                        <img src={item.photo} alt="" />
                                        <div>
                                            <p className="name">{item.first_name} {item.last_name}</p>
                                            <p>{item.username}</p>
                                        </div>
                                    </div>
                                    <button type="button" className="btn" onClick={handleViewUser}>view</button>
                                </li>
                            ))}
                            {connections.filter((item) => {return item.status === 'active'}).length === 0 && <p className="emptyMsg"><small>No active connections.</small></p>}
                            {/* <li id="65b6bb93-6d94-4120-8404-669ec6809c47">
                                <div className="summary">
                                    <img src="/images/default/default-user-photo.png" alt="" />
                                    <div>
                                        <p className="name">Nathan Test</p>
                                        <p>nathan</p>
                                    </div>
                                </div>
                                <button type="button" className="btn" onClick={handleViewUser}>view</button>
                            </li> */}
                        </ul>
                    </section>
                    <section className="pending-connections">
                        <h5 className="pending"><img src={pendingIcon} className="colored-connection-icon" alt="" />Pending</h5>
                        <ul>
                            {connections.filter((item) => {
                                return item.status === 'pending'
                            }).map((item) => (
                                <li id={item.user_id} key={item.username}>
                                    <div className="summary">
                                        <img src={item.photo} alt="" />
                                        <div>
                                            <p className="name">{item.first_name} {item.last_name}</p>
                                            <p>{item.username}</p>
                                        </div>
                                    </div>
                                    <button type="button" className="btn" onClick={handleViewUser}>view</button>
                                </li>
                            ))}
                            {connections.filter((item) => {return item.status === 'pending'}).length === 0 && <p className="emptyMsg"><small>No pending connections.</small></p>}
                        </ul>
                    </section>
                    <section className="inactive-connections">
                        <h5 className="inactive"><img src={inactiveIcon} className="colored-connection-icon" alt="" />Inactive</h5>
                        <ul>
                            {connections.filter((item) => {
                                return item.status === 'inactive'
                            }).map((item) => (
                                <li id={item.user_id} key={item.username}>
                                    <div className="summary">
                                        <img src={item.photo} alt="" />
                                        <div>
                                            <p className="name">{item.first_name} {item.last_name}</p>
                                            <p>{item.username}</p>
                                        </div>
                                    </div>
                                    <button type="button" className="btn" onClick={handleViewUser}>view</button>
                                </li>
                            ))}
                            {connections.filter((item) => {return item.status === 'inactive'}).length === 0 && <p className="emptyMsg"><small>No inactive connections.</small></p>}
                        </ul>
                    </section>
                </section>
                <section className="groups pannel">
                    <h3>Groups</h3>
                    <section className="course-groups">
                        <h5>Course</h5>
                        <ul>
                            {courses.map((course, index) => (
                                <li id={course.course_id}  key={course.course_id} data-index={index} data-group-type="course">
                                    <div className="summary">
                                        <img src={course.photo} alt="" />
                                        <div>
                                            <p className="name">{course.group_name}</p>
                                            <p>{course.group_description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <button type="button" className="btn" onClick={handleViewGroup}>view</button>
                                    </div>
                                </li>
                            ))}
                            {courses.length === 0 && <p><small>You have no enrolled courses.</small></p>}
                        </ul>
                    </section>
                    <section className="community-groups">
                        <h5>Community</h5>
                        <ul>
                            {communities.map((community, index) => (
                                <li id={community.community_id} key={community.community_id} data-index={index} data-group-type="community">
                                    <div className="summary">
                                        <img src={community.photo} alt="" />
                                        <div>
                                            <p className="name">{community.group_name}</p>
                                            <p>{community.group_description}</p>
                                        </div>
                                    </div>
                                    <div className="icon-buttons">
                                        {community.created_by === user.user_id && <img className="status-icon-img" src={crownIcon} alt="" />}
                                        {community.visibility === 'private' && <img className="status-icon-img" src={privateIcon} alt="" />}
                                        <button type="button" className="btn" onClick={handleViewGroup}>view</button>
                                    </div>
                                </li>
                            ))}
                            {communities.length === 0 && <p><small>You haven't joined any communities.</small></p>}
                        </ul>
                    </section>
                </section>
            </div>
            {viewerState && ViewerWindow()}
        </div>
    )
}